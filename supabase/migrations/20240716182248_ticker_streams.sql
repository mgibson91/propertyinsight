create extension if not exists "timescaledb" with schema "public" version '2.9.1';

create table "public"."ticker_stream_data" (
    "timestamp" bigint not null,
    "stream_id" uuid not null,
    "open" real not null,
    "close" real not null,
    "high" real not null,
    "low" real not null,
    "volume_usd" real not null
);


alter table "public"."ticker_stream_data" enable row level security;

create type "public"."ticker_stream_type" as enum ('crypto', 'forex');

create table "public"."ticker_streams" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "ticker" text not null,
    "source" text not null,
    "period" text not null,
    "tag" text not null,
    "category_tag" ticker_stream_type not null
);


alter table "public"."ticker_streams" enable row level security;

CREATE UNIQUE INDEX ticker_stream_data_pkey ON public.ticker_stream_data USING btree ("timestamp", stream_id);

CREATE INDEX ticker_stream_data_time_idx ON public.ticker_stream_data USING btree ("timestamp" DESC);

CREATE UNIQUE INDEX ticker_streams_pkey ON public.ticker_streams USING btree (id);

alter table "public"."ticker_stream_data" add constraint "ticker_stream_data_pkey" PRIMARY KEY using index "ticker_stream_data_pkey";

alter table "public"."ticker_streams" add constraint "ticker_streams_pkey" PRIMARY KEY using index "ticker_streams_pkey";

alter table "public"."ticker_stream_data" add constraint "ticker_stream_data_stream_id_fkey" FOREIGN KEY (stream_id) REFERENCES ticker_streams(id) not valid;

alter table "public"."ticker_stream_data" validate constraint "ticker_stream_data_stream_id_fkey";

grant delete on table "public"."ticker_stream_data" to "anon";

grant insert on table "public"."ticker_stream_data" to "anon";

grant references on table "public"."ticker_stream_data" to "anon";

grant select on table "public"."ticker_stream_data" to "anon";

grant trigger on table "public"."ticker_stream_data" to "anon";

grant truncate on table "public"."ticker_stream_data" to "anon";

grant update on table "public"."ticker_stream_data" to "anon";

grant delete on table "public"."ticker_stream_data" to "authenticated";

grant insert on table "public"."ticker_stream_data" to "authenticated";

grant references on table "public"."ticker_stream_data" to "authenticated";

grant select on table "public"."ticker_stream_data" to "authenticated";

grant trigger on table "public"."ticker_stream_data" to "authenticated";

grant truncate on table "public"."ticker_stream_data" to "authenticated";

grant update on table "public"."ticker_stream_data" to "authenticated";

grant delete on table "public"."ticker_stream_data" to "service_role";

grant insert on table "public"."ticker_stream_data" to "service_role";

grant references on table "public"."ticker_stream_data" to "service_role";

grant select on table "public"."ticker_stream_data" to "service_role";

grant trigger on table "public"."ticker_stream_data" to "service_role";

grant truncate on table "public"."ticker_stream_data" to "service_role";

grant update on table "public"."ticker_stream_data" to "service_role";

grant delete on table "public"."ticker_streams" to "anon";

grant insert on table "public"."ticker_streams" to "anon";

grant references on table "public"."ticker_streams" to "anon";

grant select on table "public"."ticker_streams" to "anon";

grant trigger on table "public"."ticker_streams" to "anon";

grant truncate on table "public"."ticker_streams" to "anon";

grant update on table "public"."ticker_streams" to "anon";

grant delete on table "public"."ticker_streams" to "authenticated";

grant insert on table "public"."ticker_streams" to "authenticated";

grant references on table "public"."ticker_streams" to "authenticated";

grant select on table "public"."ticker_streams" to "authenticated";

grant trigger on table "public"."ticker_streams" to "authenticated";

grant truncate on table "public"."ticker_streams" to "authenticated";

grant update on table "public"."ticker_streams" to "authenticated";

grant delete on table "public"."ticker_streams" to "service_role";

grant insert on table "public"."ticker_streams" to "service_role";

grant references on table "public"."ticker_streams" to "service_role";

grant select on table "public"."ticker_streams" to "service_role";

grant trigger on table "public"."ticker_streams" to "service_role";

grant truncate on table "public"."ticker_streams" to "service_role";

grant update on table "public"."ticker_streams" to "service_role";

select create_hypertable('ticker_stream_data', 'timestamp', chunk_time_interval => 86400000000);