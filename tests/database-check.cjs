const {PGlite}=require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
const db=new PGlite();await db.exec(`
 create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid,name text,bucket_id text);
 create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
`);
for(const f of ['001_citas.sql','002_profiles.sql'])await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase',f),'utf8'));
console.log('PASS both migrations execute');
const ids=[1,2,3,4,5].map(i=>'00000000-0000-4000-8000-'+String(i).padStart(12,'0'));
for(let i=0;i<ids.length;i++)await db.query('insert into auth.users values($1,$2)',[ids[i],JSON.stringify({role:i<2?'user':'interpreter',firstName:'Account '+i,languages:i===4?['English']:['LESSA'],specialties:['Banking'],experience:10-i})]);
await db.exec("update public.interpreter_profiles set verification_status='verified',available=true,last_seen=now()");
async function as(id,sql,args=[]){await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);try{return await db.query(sql,args);}finally{await db.exec('reset role');}}
async function create(user=ids[0],date=null){return (await as(user,"select public.create_request('BAC','Banking','LESSA','Open an account',$1) id",[date])).rows[0].id;}
async function row(id){return (await db.query('select * from service_requests where id=$1',[id])).rows[0];}
async function action(who,id,action){return as(who,'select public.respond_request($1,$2)',[id,action]);}
const r1=await create();assert.equal((await row(r1)).assigned_interpreter_id,ids[2]);console.log('PASS ranking by language, specialty and experience');
const r2=await create(ids[1]);assert.equal((await row(r2)).assigned_interpreter_id,ids[3]);console.log('PASS occupied interpreter excluded');
assert.equal((await as(ids[4],'select * from service_requests')).rows.length,0);await assert.rejects(action(ids[4],r1,'accept'));console.log('PASS unrelated user cannot read or accept');
await assert.rejects(as(ids[2],"update interpreter_profiles set verification_status='verified'"));await assert.rejects(as(ids[0],'select public.match_queue()'));console.log('PASS no self-verification or direct queue access');
await action(ids[1],r2,'cancel');await action(ids[2],r1,'decline');assert.equal((await row(r1)).assigned_interpreter_id,ids[3]);console.log('PASS rejection reassigns to next eligible interpreter');
await action(ids[3],r1,'accept');assert.equal((await row(r1)).status,'accepted');assert.equal((await db.query('select * from sessions where request_id=$1',[r1])).rows.length,1);await assert.rejects(action(ids[3],r1,'accept'));console.log('PASS acceptance creates exactly one session');
await action(ids[0],r1,'start');await action(ids[3],r1,'finish');assert.equal((await row(r1)).status,'completed');console.log('PASS start and finish transition');
await db.exec("update interpreter_profiles set available=false");const waiting=await create();assert.equal((await row(waiting)).status,'waiting');await as(ids[2],'select public.set_availability(true)');assert.equal((await row(waiting)).status,'assigned');console.log('PASS waiting request matched when interpreter becomes available');
await db.exec("update interpreter_profiles set available=true,last_seen=now()");await db.query("update service_requests set assigned_at=now()-interval '2 minutes' where id=$1",[waiting]);await as(ids[0],'select public.sync_requests()');assert.equal((await row(waiting)).assigned_interpreter_id,ids[3]);console.log('PASS expired offer reassigns');
await action(ids[0],waiting,'cancel');const scheduled=await create(ids[0],new Date(Date.now()+86400000).toISOString());const owner=(await row(scheduled)).assigned_interpreter_id;await action(owner,scheduled,'accept');await assert.rejects(action(ids[0],scheduled,'start'));console.log('PASS future appointment cannot join early');await action(ids[0],scheduled,'cancel');
await db.exec("update interpreter_profiles set last_seen=now()-interval '5 minutes'");const offline=await create();assert.equal((await row(offline)).status,'waiting');console.log('PASS offline interpreters excluded');
await assert.rejects(create(ids[2]));await assert.rejects(create(ids[0],new Date(Date.now()-10000).toISOString()));console.log('PASS interpreter cannot create user requests; past dates rejected');
await db.close();
})().catch(e=>{console.error(e);process.exitCode=1;});

