const { Kysely, PostgresDialect, sql } = require('kysely');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.test file
dotenv.config({ path: '.env.local' });

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 10,
  }),
});

const db = new Kysely({
  dialect,
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const user1 = await supabase.auth.signUp({ email: 'a@a.a', password: 'qweqweqwe' });
  const user2 = await supabase.auth.signUp({ email: 'b@b.b', password: 'qweqweqwe' });
  const user3 = await supabase.auth.signUp({ email: 'c@c.c', password: 'qweqweqwe' });
  const user4 = await supabase.auth.signUp({ email: 'd@d.d', password: 'qweqweqwe' });

  //   await sql`
  // INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password) VALUES ('f9da86f3-b364-4050-9023-f9921a760577', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@a.a', '$2a$10$fyqctlg/Up.D0.zZ0dosPODr0HpMvK6djx69bcWhwBCB.LD9j1z7u');
  // INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password) VALUES ('d5a33e4e-e60c-4a48-af5f-950ac59aa9c6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@b.b', '$2a$10$fyqctlg/Up.D0.zZ0dosPODr0HpMvK6djx69bcWhwBCB.LD9j1z7u');
  // INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password) VALUES ('e54c9010-c5f0-41fc-900a-5147c2e4b65d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@b.b', '$2a$10$fyqctlg/Up.D0.zZ0dosPODr0HpMvK6djx69bcWhwBCB.LD9j1z7u');`.execute(
  //     db
  //   );

  const user1ID = user1.data.user.id;
  const user2ID = user2.data.user.id;
  const user3ID = user3.data.user.id;

  await sql`
INSERT INTO boards (id, created_at, name, creating_user_id) VALUES ('4c0467a7-7b5b-434c-85c5-c2a9baa4e969', '2023-09-25', 'roadmap-dev', ${user1ID});`.execute(
    db
  );

  await sql`
INSERT INTO board_columns (id, board_id, title, position, creating_user_id) VALUES
('6a6a1bd9-6401-4621-9038-f0db161b6201', '4c0467a7-7b5b-434c-85c5-c2a9baa4e969', 'To Do', 1, ${user1ID}),
('814a600e-8365-4c6c-aae9-68ea3e394f07', '4c0467a7-7b5b-434c-85c5-c2a9baa4e969', 'In Progress', 2, ${user1ID}),
('0cf4c61d-b276-419d-9d68-fbd9dc43f841', '4c0467a7-7b5b-434c-85c5-c2a9baa4e969', 'Done', 3, ${user1ID});`.execute(db);

  await sql`
INSERT INTO board_items (id, column_id, title, created_at, position, creating_user_id) VALUES
('fba8672d-c194-45cb-8418-2d58fe279f0f', '6a6a1bd9-6401-4621-9038-f0db161b6201', 'Feature 1', '2023-10-25', 1, ${user1ID}),
('64eb1893-600a-49a3-8006-1a6f752752d7', '814a600e-8365-4c6c-aae9-68ea3e394f07', 'Feature 2', '2024-02-10', 2, ${user1ID}),
('e7891a7b-bcc2-4be2-95fb-3fea5502eb49', '0cf4c61d-b276-419d-9d68-fbd9dc43f841', 'Feature 3', '2024-01-15', 3, ${user1ID});`.execute(
    db
  );

  await sql`
INSERT INTO board_votes (item_id, user_id, count) VALUES
('fba8672d-c194-45cb-8418-2d58fe279f0f', ${user1ID}, 2),
('fba8672d-c194-45cb-8418-2d58fe279f0f', ${user1ID}, 3),
('64eb1893-600a-49a3-8006-1a6f752752d7', ${user2ID}, 5),
('e7891a7b-bcc2-4be2-95fb-3fea5502eb49', ${user3ID}, 1);`.execute(db);
})();
