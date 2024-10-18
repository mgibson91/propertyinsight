create table "public"."default_valuations" (
    "property_id" uuid not null,
    "price" numeric not null,
    "created_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX default_valuations_pkey ON public.default_valuations USING btree (property_id);

alter table "public"."default_valuations" add constraint "default_valuations_pkey" PRIMARY KEY using index "default_valuations_pkey";

alter table "public"."default_valuations" add constraint "default_valuations_property_id_fkey" FOREIGN KEY (property_id) REFERENCES property_listings(id) not valid;

alter table "public"."default_valuations" validate constraint "default_valuations_property_id_fkey";

grant delete on table "public"."default_valuations" to "anon";

grant insert on table "public"."default_valuations" to "anon";

grant references on table "public"."default_valuations" to "anon";

grant select on table "public"."default_valuations" to "anon";

grant trigger on table "public"."default_valuations" to "anon";

grant truncate on table "public"."default_valuations" to "anon";

grant update on table "public"."default_valuations" to "anon";

grant delete on table "public"."default_valuations" to "authenticated";

grant insert on table "public"."default_valuations" to "authenticated";

grant references on table "public"."default_valuations" to "authenticated";

grant select on table "public"."default_valuations" to "authenticated";

grant trigger on table "public"."default_valuations" to "authenticated";

grant truncate on table "public"."default_valuations" to "authenticated";

grant update on table "public"."default_valuations" to "authenticated";

grant delete on table "public"."default_valuations" to "service_role";

grant insert on table "public"."default_valuations" to "service_role";

grant references on table "public"."default_valuations" to "service_role";

grant select on table "public"."default_valuations" to "service_role";

grant trigger on table "public"."default_valuations" to "service_role";

grant truncate on table "public"."default_valuations" to "service_role";

grant update on table "public"."default_valuations" to "service_role";


