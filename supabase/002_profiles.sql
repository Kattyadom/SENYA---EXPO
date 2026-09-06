begin;
alter table public.profiles add column preferences jsonb not null default '{}';
create function public.save_profile(p_first_name text,p_last_name text,p_phone text,p_birthday text,p_whatsapp text,p_address text,p_preferences jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 update public.profiles set first_name=left(p_first_name,100),last_name=left(p_last_name,100),phone=left(p_phone,50),birthday=left(p_birthday,10),whatsapp=left(p_whatsapp,50),address=left(p_address,300),preferences=p_preferences where id=auth.uid();
end $$;
create function public.session_contact(p_id uuid) returns table(first_name text,last_name text) language plpgsql security definer set search_path='' as $$
begin
 return query select p.first_name,p.last_name from public.service_requests r join public.profiles p on p.id=case when r.user_id=auth.uid() then r.assigned_interpreter_id else r.user_id end where r.id=p_id and (r.user_id=auth.uid() or r.assigned_interpreter_id=auth.uid()) and r.status in ('accepted','in_progress','completed');
end $$;
revoke execute on function public.save_profile(text,text,text,text,text,text,jsonb),public.session_contact(uuid) from public,anon,authenticated;
grant execute on function public.save_profile(text,text,text,text,text,text,jsonb),public.session_contact(uuid) to authenticated;
-- Certificates are private and can only be uploaded/read by the owner.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('certificates','certificates',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy certificate_upload on storage.objects for insert to authenticated with check(bucket_id='certificates' and (storage.foldername(name))[1]=auth.uid()::text);
create policy certificate_read on storage.objects for select to authenticated using(bucket_id='certificates' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
