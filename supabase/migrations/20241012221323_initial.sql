create type "public"."listing-source" as enum ('property-news');

create type "public"."property-type" as enum ('apartment', 'bungalow', 'detached', 'semi-detached', 'terraced', 'townhouse', 'villa', 'land', 'cottage', 'site', 'special-use');

create table "public"."addresses" (
    "property_id" uuid not null,
    "line1" character varying,
    "line2" character varying,
    "town" character varying,
    "postcode" character varying
);


create table "public"."feedback" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "feedback" text not null
);


alter table "public"."feedback" enable row level security;

create table "public"."property_listings" (
    "source_id" character varying not null,
    "price" numeric not null,
    "currency" character varying not null,
    "type" "property-type" not null,
    "bedrooms" integer not null,
    "receptions" integer not null,
    "metadata" jsonb not null,
    "source" "listing-source" not null,
    "id" uuid not null default gen_random_uuid()
);


CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (property_id);

CREATE UNIQUE INDEX feedback_pkey ON public.feedback USING btree (id);

CREATE UNIQUE INDEX property_listings_pkey ON public.property_listings USING btree (id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."feedback" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."property_listings" add constraint "property_listings_pkey" PRIMARY KEY using index "property_listings_pkey";

alter table "public"."addresses" add constraint "addresses_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property_listings(id) not valid;

alter table "public"."addresses" validate constraint "addresses_property_id_fkey";

alter table "public"."feedback" add constraint "feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."feedback" validate constraint "feedback_user_id_fkey";

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."feedback" to "anon";

grant insert on table "public"."feedback" to "anon";

grant references on table "public"."feedback" to "anon";

grant select on table "public"."feedback" to "anon";

grant trigger on table "public"."feedback" to "anon";

grant truncate on table "public"."feedback" to "anon";

grant update on table "public"."feedback" to "anon";

grant delete on table "public"."feedback" to "authenticated";

grant insert on table "public"."feedback" to "authenticated";

grant references on table "public"."feedback" to "authenticated";

grant select on table "public"."feedback" to "authenticated";

grant trigger on table "public"."feedback" to "authenticated";

grant truncate on table "public"."feedback" to "authenticated";

grant update on table "public"."feedback" to "authenticated";

grant delete on table "public"."feedback" to "service_role";

grant insert on table "public"."feedback" to "service_role";

grant references on table "public"."feedback" to "service_role";

grant select on table "public"."feedback" to "service_role";

grant trigger on table "public"."feedback" to "service_role";

grant truncate on table "public"."feedback" to "service_role";

grant update on table "public"."feedback" to "service_role";

grant delete on table "public"."property_listings" to "anon";

grant insert on table "public"."property_listings" to "anon";

grant references on table "public"."property_listings" to "anon";

grant select on table "public"."property_listings" to "anon";

grant trigger on table "public"."property_listings" to "anon";

grant truncate on table "public"."property_listings" to "anon";

grant update on table "public"."property_listings" to "anon";

grant delete on table "public"."property_listings" to "authenticated";

grant insert on table "public"."property_listings" to "authenticated";

grant references on table "public"."property_listings" to "authenticated";

grant select on table "public"."property_listings" to "authenticated";

grant trigger on table "public"."property_listings" to "authenticated";

grant truncate on table "public"."property_listings" to "authenticated";

grant update on table "public"."property_listings" to "authenticated";

grant delete on table "public"."property_listings" to "service_role";

grant insert on table "public"."property_listings" to "service_role";

grant references on table "public"."property_listings" to "service_role";

grant select on table "public"."property_listings" to "service_role";

grant trigger on table "public"."property_listings" to "service_role";

grant truncate on table "public"."property_listings" to "service_role";

grant update on table "public"."property_listings" to "service_role";


