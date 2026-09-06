-- Run once in a new Supabase project's SQL editor.
begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 role text not null check(role in ('user','interpreter')),
 first_name text not null default '', last_name text not null default '',
 phone text not null default '', birthday text default '', whatsapp text default '', address text default ''
);
create table public.interpreter_profiles (
 user_id uuid primary key references public.profiles on delete cascade,
 languages text[] not null, specialties text[] not null,
 experience integer not null default 0 check(experience>=0), bio text default '', certification text default '',
 verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected')),
 available boolean not null default false, last_seen timestamptz, last_assigned timestamptz
);
create table public.service_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles,
 service text not null check(length(service) between 1 and 120),
 specialty text not null check(specialty in ('Banking','Healthcare','Government','Telecommunications','Utilities','General')),
 language text not null check(language in ('LESSA','Spanish','English')),
 details text not null check(length(details) between 1 and 3000),
 scheduled_at timestamptz, created_at timestamptz not null default now(),
 status text not null default 'waiting' check(status in ('waiting','assigned','accepted','in_progress','completed','cancelled')),
 assigned_interpreter_id uuid references public.profiles, assigned_at timestamptz,
 accepted_at timestamptz, ended_at timestamptz,
 declined_ids uuid[] not null default '{}'
);
create unique index one_reserved_request on public.service_requests(assigned_interpreter_id) where status in ('assigned','accepted','in_progress');
create index request_owner on public.service_requests(user_id,created_at desc);
create table public.sessions (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.service_requests,
 user_id uuid not null references public.profiles, interpreter_id uuid not null references public.profiles,
 status text not null default 'ready' check(status in ('ready','active','completed')), started_at timestamptz, ended_at timestamptz
);
create function public.register_profile() returns trigger language plpgsql security definer set search_path='' as $$
declare m jsonb := new.raw_user_meta_data; r text;
begin
 r := case when m->>'role'='interpreter' then 'interpreter' else 'user' end;
 insert into public.profiles(id,role,first_name,last_name,phone,birthday,whatsapp,address)
 values(new.id,r,coalesce(m->>'firstName',''),coalesce(m->>'lastName',''),coalesce(m->>'phone',''),coalesce(m->>'birthday',''),coalesce(m->>'whatsapp',''),coalesce(m->>'address',''));
 if r='interpreter' then
 insert into public.interpreter_profiles(user_id,languages,specialties,experience,bio,certification)
 values(new.id,array(select jsonb_array_elements_text(coalesce(m->'languages','[]'))),array(select jsonb_array_elements_text(coalesce(m->'specialties','[]'))),greatest(0,coalesce((m->>'experience')::integer,0)),coalesce(m->>'bio',''),coalesce(m->>'certification',''));
 end if;
 return new;
end $$;
create trigger senya_registration after insert on auth.users for each row execute function public.register_profile();

-- All queue transitions serialize so two users cannot reserve the same interpreter.
create function public.match_queue() returns void language plpgsql security definer set search_path='' as $$
declare q record; candidate uuid;
begin
 perform pg_advisory_xact_lock(724019);
 update public.service_requests set declined_ids=array_append(declined_ids,assigned_interpreter_id), assigned_interpreter_id=null, assigned_at=null,status='waiting'
 where status='assigned' and assigned_at < now()-interval '90 seconds';
 for q in select * from public.service_requests where status='waiting' order by created_at,id for update loop
 select i.user_id into candidate from public.interpreter_profiles i
 where i.verification_status='verified' and i.available and i.last_seen>now()-interval '45 seconds'
 and q.language=any(i.languages) and q.specialty=any(i.specialties)
 and not (i.user_id=any(q.declined_ids))
 and not exists(select 1 from public.service_requests a where a.assigned_interpreter_id=i.user_id and a.status in ('assigned','accepted','in_progress'))
 order by i.experience desc, i.last_assigned asc nulls first, i.user_id limit 1;
 if candidate is not null then
 update public.service_requests set assigned_interpreter_id=candidate,assigned_at=now(),status='assigned' where id=q.id;
 update public.interpreter_profiles set last_assigned=now() where user_id=candidate;
 end if;
 end loop;
end $$;

create function public.create_request(p_service text,p_specialty text,p_language text,p_details text,p_scheduled_at timestamptz default null,p_id uuid default gen_random_uuid()) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='user') then raise exception 'User account required'; end if;
 if p_scheduled_at is not null and p_scheduled_at<=now() then raise exception 'Choose a future appointment'; end if;
 perform pg_advisory_xact_lock(724019);
 if exists(select 1 from public.service_requests where id=p_id and user_id=auth.uid()) then return p_id; end if;
 insert into public.service_requests(id,user_id,service,specialty,language,details,scheduled_at) values(p_id,auth.uid(),trim(p_service),p_specialty,p_language,trim(p_details),p_scheduled_at);
 perform public.match_queue(); return p_id;
end $$;

create function public.set_availability(p_available boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(724019);
 update public.interpreter_profiles set available=p_available,last_seen=now() where user_id=auth.uid() and verification_status='verified';
 if not found then raise exception 'Verified interpreter account required'; end if;
 if not p_available then
 update public.service_requests set declined_ids=array_append(declined_ids,assigned_interpreter_id),assigned_interpreter_id=null,assigned_at=null,status='waiting' where assigned_interpreter_id=auth.uid() and status='assigned';
 end if;
 perform public.match_queue();
end $$;

create function public.sync_requests() returns setof public.service_requests language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 perform pg_advisory_xact_lock(724019);
 update public.interpreter_profiles set last_seen=now() where user_id=auth.uid();
 perform public.match_queue();
 return query select * from public.service_requests where user_id=auth.uid() or assigned_interpreter_id=auth.uid() order by created_at desc;
end $$;

create function public.respond_request(p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare q public.service_requests;
begin
 perform pg_advisory_xact_lock(724019);
 select * into q from public.service_requests where id=p_id for update;
 if q.id is null or auth.uid() is null then raise exception 'Request unavailable'; end if;
 if p_action in ('accept','decline') then
 if q.assigned_interpreter_id is distinct from auth.uid() or q.status<>'assigned' or q.assigned_at<now()-interval '90 seconds' then raise exception 'This offer is no longer available'; end if;
 if p_action='accept' then
 if not exists(select 1 from public.interpreter_profiles where user_id=auth.uid() and verification_status='verified' and available) then raise exception 'Set your status to Available'; end if;
 update public.service_requests set status='accepted',accepted_at=now() where id=p_id;
 insert into public.sessions(request_id,user_id,interpreter_id) values(p_id,q.user_id,auth.uid());
 else
 update public.service_requests set status='waiting',declined_ids=array_append(declined_ids,auth.uid()),assigned_interpreter_id=null,assigned_at=null where id=p_id;
 end if;
 elsif p_action='cancel' then
 if q.user_id is distinct from auth.uid() or q.status not in ('waiting','assigned','accepted') then raise exception 'Cannot cancel this request'; end if;
 update public.service_requests set status='cancelled',ended_at=now() where id=p_id;
 update public.sessions set status='completed',ended_at=now() where request_id=p_id;
 elsif p_action in ('start','finish') then
 if (q.user_id is distinct from auth.uid() and q.assigned_interpreter_id is distinct from auth.uid()) or q.status not in ('accepted','in_progress') then raise exception 'Session unavailable'; end if;
 if p_action='start' then
 if q.scheduled_at is not null and q.scheduled_at>now()+interval '10 minutes' then raise exception 'The room opens 10 minutes before your appointment'; end if;
 update public.service_requests set status='in_progress' where id=p_id;
 update public.sessions set status='active',started_at=coalesce(started_at,now()) where request_id=p_id;
 else
 update public.service_requests set status='completed',ended_at=now() where id=p_id;
 update public.sessions set status='completed',ended_at=now() where request_id=p_id;
 end if;
 else raise exception 'Unknown action'; end if;
 perform public.match_queue();
end $$;

alter table public.profiles enable row level security;
alter table public.interpreter_profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.sessions enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy own_interpreter_profile on public.interpreter_profiles for select to authenticated using(user_id=auth.uid());
create policy own_requests on public.service_requests for select to authenticated using(user_id=auth.uid() or assigned_interpreter_id=auth.uid());
create policy own_sessions on public.sessions for select to authenticated using(user_id=auth.uid() or interpreter_id=auth.uid());
revoke all on public.profiles,public.interpreter_profiles,public.service_requests,public.sessions from anon,authenticated;
grant select on public.profiles,public.interpreter_profiles,public.service_requests,public.sessions to authenticated;
revoke execute on function public.register_profile(),public.match_queue(),public.create_request(text,text,text,text,timestamptz,uuid),public.set_availability(boolean),public.sync_requests(),public.respond_request(uuid,text) from public,anon,authenticated;
grant execute on function public.create_request(text,text,text,text,timestamptz,uuid),public.set_availability(boolean),public.sync_requests(),public.respond_request(uuid,text) to authenticated;
commit;
