begin;
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check(role in ('user','interpreter','admin'));
-- Public registration still maps every role other than interpreter to user.
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
create table public.interpreter_reviews(
 id uuid primary key default gen_random_uuid(), interpreter_id uuid not null references public.interpreter_profiles(user_id),
 reviewer_id uuid not null references public.profiles(id), decision text not null check(decision in ('verified','rejected')),
 note text not null default '', created_at timestamptz not null default now()
);
alter table public.interpreter_reviews enable row level security;
revoke all on public.interpreter_reviews from anon,authenticated;
grant select on public.interpreter_reviews to authenticated;
create policy admin_reviews on public.interpreter_reviews for select to authenticated using(public.is_admin());
create policy admin_certificates on storage.objects for select to authenticated using(bucket_id='certificates' and public.is_admin());
create function public.admin_applications() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 return coalesce((select jsonb_agg(item order by item->>'verification_status',item->>'first_name') from (
 select jsonb_build_object('id',i.user_id,'first_name',p.first_name,'last_name',p.last_name,'phone',p.phone,'languages',i.languages,'specialties',i.specialties,'experience',i.experience,'bio',i.bio,'certification',i.certification,'verification_status',i.verification_status,
 'certificates',coalesce((select jsonb_agg(o.name order by o.name) from storage.objects o where o.bucket_id='certificates' and (storage.foldername(o.name))[1]=i.user_id::text),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(jsonb_build_object('decision',r.decision,'note',r.note,'created_at',r.created_at) order by r.created_at desc) from public.interpreter_reviews r where r.interpreter_id=i.user_id),'[]'::jsonb)) item
 from public.interpreter_profiles i join public.profiles p on p.id=i.user_id
 ) applications),'[]'::jsonb);
end $$;
create function public.review_interpreter(p_id uuid,p_decision text,p_note text default '') returns void language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 if p_decision not in ('verified','rejected') or p_decision is null then raise exception 'Invalid decision'; end if;
 if length(coalesce(p_note,''))>2000 then raise exception 'Review note is too long'; end if;
 if p_decision='rejected' and length(trim(coalesce(p_note,'')))=0 then raise exception 'Explain why the application is rejected'; end if;
 select verification_status into current_status from public.interpreter_profiles where user_id=p_id for update;
 if current_status is distinct from 'pending' then raise exception 'This application is no longer pending. Refresh the list.'; end if;
 if p_decision='verified' and not exists(select 1 from storage.objects where bucket_id='certificates' and (storage.foldername(name))[1]=p_id::text) then raise exception 'A certificate must be uploaded before approval'; end if;
 update public.interpreter_profiles set verification_status=p_decision,available=false where user_id=p_id;
 insert into public.interpreter_reviews(interpreter_id,reviewer_id,decision,note) values(p_id,auth.uid(),p_decision,trim(coalesce(p_note,'')));
end $$;
revoke execute on function public.is_admin(),public.admin_applications(),public.review_interpreter(uuid,text,text) from public,anon,authenticated;
grant execute on function public.is_admin(),public.admin_applications(),public.review_interpreter(uuid,text,text) to authenticated;
commit;
