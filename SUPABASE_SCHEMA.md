create table leads (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  created_at timestamp default now()
);