begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.families (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  role text not null check (role in ('admin', 'member')),
  joined_at timestamptz not null default pg_catalog.now(),
  primary key (family_id, user_id)
);

create table if not exists public.family_invites (
  token_hash text primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null default (pg_catalog.now() + interval '7 days'),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz
);

create table if not exists public.family_records (
  family_id uuid not null references public.families(id) on delete cascade,
  record_type text not null check (
    record_type in (
      'appointment',
      'birthday',
      'shopping_item',
      'school_schedule',
      'family_note',
      'doctor_visit',
      'notification_settings',
      'profile'
    )
  ),
  record_id text not null check (char_length(record_id) between 1 and 120),
  visibility text not null default 'shared'
    check (visibility in ('shared', 'private')),
  owner_user_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (family_id, record_type, record_id),
  check (
    (visibility = 'shared' and owner_user_id is null) or
    (visibility = 'private' and owner_user_id is not null)
  )
);

create index if not exists family_records_owner_idx
  on public.family_records (family_id, owner_user_id)
  where visibility = 'private';

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members as member
    where member.family_id = target_family_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.is_family_admin(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members as member
    where member.family_id = target_family_id
      and member.user_id = auth.uid()
      and member.role = 'admin'
  );
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invites enable row level security;
alter table public.family_records enable row level security;

revoke all on public.families from anon, authenticated;
revoke all on public.family_members from anon, authenticated;
revoke all on public.family_invites from anon, authenticated;
revoke all on public.family_records from anon, authenticated;

grant select (id, name, created_at) on public.families to authenticated;
grant update (name) on public.families to authenticated;
grant select (family_id, display_name, role, joined_at)
  on public.family_members to authenticated;
grant select, insert, update, delete on public.family_records to authenticated;

drop policy if exists "Members can read their families" on public.families;
create policy "Members can read their families"
  on public.families for select to authenticated
  using (public.is_family_member(id));

drop policy if exists "Admins can rename their families" on public.families;
create policy "Admins can rename their families"
  on public.families for update to authenticated
  using (public.is_family_admin(id))
  with check (public.is_family_admin(id));

drop policy if exists "Members can read their family membership" on public.family_members;
create policy "Members can read their family membership"
  on public.family_members for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "Members can read shared and own private records"
  on public.family_records;
create policy "Members can read shared and own private records"
  on public.family_records for select to authenticated
  using (
    public.is_family_member(family_id)
    and (visibility = 'shared' or owner_user_id = auth.uid())
  );

drop policy if exists "Members can create shared or own private records"
  on public.family_records;
create policy "Members can create shared or own private records"
  on public.family_records for insert to authenticated
  with check (
    public.is_family_member(family_id)
    and (
      (visibility = 'shared' and owner_user_id is null)
      or (visibility = 'private' and owner_user_id = auth.uid())
    )
  );

drop policy if exists "Members can update shared or own private records"
  on public.family_records;
create policy "Members can update shared or own private records"
  on public.family_records for update to authenticated
  using (
    public.is_family_member(family_id)
    and (visibility = 'shared' or owner_user_id = auth.uid())
  )
  with check (
    public.is_family_member(family_id)
    and (
      (visibility = 'shared' and owner_user_id is null)
      or (visibility = 'private' and owner_user_id = auth.uid())
    )
  );

drop policy if exists "Members can delete shared or own private records"
  on public.family_records;
create policy "Members can delete shared or own private records"
  on public.family_records for delete to authenticated
  using (
    public.is_family_member(family_id)
    and (visibility = 'shared' or owner_user_id = auth.uid())
  );

create or replace function public.create_family(
  p_family_name text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_family_name is null or char_length(btrim(p_family_name)) not between 1 and 80 then
    raise exception 'Family name must contain 1 to 80 characters';
  end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Display name must contain 1 to 80 characters';
  end if;

  insert into public.families (name, created_by)
  values (btrim(p_family_name), auth.uid())
  returning id into new_family_id;

  insert into public.family_members (family_id, user_id, display_name, role)
  values (new_family_id, auth.uid(), btrim(p_display_name), 'admin');

  return new_family_id;
end;
$$;

create or replace function public.create_family_invite(
  p_family_id uuid,
  p_invited_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_token text;
begin
  if auth.uid() is null or not public.is_family_admin(p_family_id) then
    raise exception 'Family administrator access required';
  end if;
  if p_invited_email is null
     or lower(btrim(p_invited_email)) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid invitation email is required';
  end if;

  invite_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.family_invites (
    token_hash,
    family_id,
    created_by,
    invited_email
  )
  values (
    encode(extensions.digest(convert_to(invite_token, 'UTF8'), 'sha256'), 'hex'),
    p_family_id,
    auth.uid(),
    lower(btrim(p_invited_email))
  );

  return invite_token;
end;
$$;

create or replace function public.accept_family_invite(
  p_token text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_hash text;
  invite_row public.family_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_token is null or lower(btrim(p_token)) !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid or expired family invitation';
  end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Display name must contain 1 to 80 characters';
  end if;

  invite_hash := encode(
    extensions.digest(convert_to(lower(btrim(p_token)), 'UTF8'), 'sha256'),
    'hex'
  );

  select *
    into invite_row
    from public.family_invites
   where token_hash = invite_hash
     and claimed_at is null
     and expires_at > pg_catalog.now()
   for update;

  if not found then
    raise exception 'Invalid or expired family invitation';
  end if;
  if lower(invite_row.invited_email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'Invalid or expired family invitation';
  end if;

  insert into public.family_members (family_id, user_id, display_name, role)
  values (invite_row.family_id, auth.uid(), btrim(p_display_name), 'member')
  on conflict (family_id, user_id) do nothing;

  update public.family_invites
     set claimed_by = auth.uid(),
         claimed_at = pg_catalog.now()
   where token_hash = invite_hash;

  return invite_row.family_id;
end;
$$;

revoke all on function public.is_family_member(uuid) from public, anon;
revoke all on function public.is_family_admin(uuid) from public, anon;
revoke all on function public.create_family(text, text) from public, anon;
revoke all on function public.create_family_invite(uuid, text) from public, anon;
revoke all on function public.accept_family_invite(text, text) from public, anon;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_admin(uuid) to authenticated;
grant execute on function public.create_family(text, text) to authenticated;
grant execute on function public.create_family_invite(uuid, text) to authenticated;
grant execute on function public.accept_family_invite(text, text) to authenticated;

commit;
