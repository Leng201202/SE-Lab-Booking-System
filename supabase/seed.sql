insert into public.pcs (code, room, status, specification)
values
  ('PC-01', 'SE Lab A · 401', 'available', 'Intel Core i5 · 16 GB RAM · RTX 3060'),
  ('PC-02', 'SE Lab A · 401', 'available', 'Intel Core i7 · 32 GB RAM · RTX 4060'),
  ('PC-03', 'SE Lab A · 401', 'available', 'Intel Core i5 · 16 GB RAM · RTX 3060'),
  ('PC-04', 'SE Lab A · 401', 'maintenance', 'Intel Core i7 · 32 GB RAM · RTX 4060'),
  ('PC-05', 'SE Lab A · 401', 'available', 'Intel Core i5 · 16 GB RAM · RTX 3060'),
  ('PC-06', 'SE Lab B · 402', 'available', 'Intel Core i7 · 32 GB RAM · RTX 4060'),
  ('PC-07', 'SE Lab B · 402', 'available', 'Intel Core i5 · 16 GB RAM · RTX 3060'),
  ('PC-08', 'SE Lab B · 402', 'maintenance', 'Intel Core i7 · 32 GB RAM · RTX 4060'),
  ('PC-09', 'SE Lab B · 402', 'available', 'Intel Core i5 · 16 GB RAM · RTX 3060'),
  ('PC-10', 'SE Lab B · 402', 'available', 'Intel Core i7 · 32 GB RAM · RTX 4060')
on conflict (code) do update
set room = excluded.room,
    status = excluded.status,
    specification = excluded.specification;

-- Add production role assignments through a protected administrative connection:
-- insert into private.role_allowlist (email, role)
-- values ('advisor@university.example', 'advisor'), ('dean@university.example', 'dean');
