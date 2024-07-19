create table "public"."user_events" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "event" text not null,
    "data" jsonb,
    "timestamp" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."user_events" enable row level security;

CREATE UNIQUE INDEX user_events_pkey ON public.user_events USING btree (id);

alter table "public"."user_events" add constraint "user_events_pkey" PRIMARY KEY using index "user_events_pkey";

alter table "public"."user_events" add constraint "user_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_events" validate constraint "user_events_user_id_fkey";


