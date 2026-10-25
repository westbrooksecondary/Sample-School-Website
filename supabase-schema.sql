create table if not exists public.staff_directory (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    title text not null,
    photo_url text,
    display_order integer not null default 0,
    created_at timestamptz not null default now()
);

alter table public.staff_directory enable row level security;

grant select on public.staff_directory to anon, authenticated;
grant insert, update, delete on public.staff_directory to authenticated;

drop policy if exists "Anyone can view staff directory" on public.staff_directory;
create policy "Anyone can view staff directory"
    on public.staff_directory for select
    to anon, authenticated
    using (true);

drop policy if exists "Admin can insert staff" on public.staff_directory;
create policy "Admin can insert staff"
    on public.staff_directory for insert
    to authenticated
    with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'nathangreenhalgh260@gmail.com');

drop policy if exists "Admin can update staff" on public.staff_directory;
create policy "Admin can update staff"
    on public.staff_directory for update
    to authenticated
    using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'nathangreenhalgh260@gmail.com')
    with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'nathangreenhalgh260@gmail.com');

drop policy if exists "Admin can delete staff" on public.staff_directory;
create policy "Admin can delete staff"
    on public.staff_directory for delete
    to authenticated
    using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'nathangreenhalgh260@gmail.com');

insert into public.staff_directory (id, full_name, title, photo_url, display_order) values
    ('2f15a994-9bd7-4f99-8e2e-013a4922c101', 'Lionel Green', 'Financial Director', 'images/team/1.jpg', 10),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c102', 'Chandler Bing', 'Financial Director', 'images/team/5.jpg', 20),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c103', 'Jacobe Martin', 'Financial Director', 'images/team/3.jpg', 30),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c104', 'Steve Smith', 'Financial Director', 'images/team/6.jpg', 40),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c105', 'Lionel Green', 'Financial Director', 'images/team/7.jpg', 50),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c106', 'Chandler Bing', 'Financial Director', 'images/team/2.jpg', 60),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c107', 'Jacobe Martin', 'Financial Director', 'images/team/8.jpg', 70),
    ('2f15a994-9bd7-4f99-8e2e-013a4922c108', 'Steve Smith', 'Financial Director', 'images/team/9.jpg', 80)
on conflict (id) do nothing;