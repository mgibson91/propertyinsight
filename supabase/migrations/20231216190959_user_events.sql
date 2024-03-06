create table "public"."user_events" (
    "tag" uutag not null default gen_random_uutag(),
    "user_tag" uutag not null,
    "event" text not null,
    "data" jsonb,
    "timestamp" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text)
);


alter table "public"."user_events" enable row level security;

CREATE UNIQUE INDEX user_events_pkey ON public.user_events USING btree (tag);

alter table "public"."user_events" add constraint "user_events_pkey" PRIMARY KEY using index "user_events_pkey";

alter table "public"."user_events" add constraint "user_events_user_tag_fkey" FOREIGN KEY (user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."user_events" valtagate constraint "user_events_user_tag_fkey";


