alter table "public"."board_votes" drop constraint "board_votes_item_id_fkey";

create table "public"."board_ideas" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "requesting_user_id" uuid not null,
    "board_id" uuid not null,
    "title" text not null,
    "description" text not null
);


alter table "public"."board_ideas" enable row level security;

CREATE UNIQUE INDEX board_ideas_pkey ON public.board_ideas USING btree (id);

alter table "public"."board_ideas" add constraint "board_ideas_pkey" PRIMARY KEY using index "board_ideas_pkey"
alter table "public"."board_ideas" add constraint "board_ideas_board_id_fkey" FOREIGN KEY (board_id) REFERENCES boards(id) not valid;

alter table "public"."board_ideas" validate constraint "board_ideas_board_id_fkey";

alter table "public"."board_ideas" add constraint "board_ideas_requesting_user_id_fkey" FOREIGN KEY (requesting_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."board_ideas" validate constraint "board_ideas_requesting_user_id_fkey";

alter table "public"."board_votes" add constraint "board_votes_item_id_fkey" FOREIGN KEY (item_id) REFERENCES board_items(id) ON DELETE CASCADE not valid;

alter table "public"."board_votes" validate constraint "board_votes_item_id_fkey";

grant delete on table "public"."board_ideas" to "anon";

grant insert on table "public"."board_ideas" to "anon";

grant references on table "public"."board_ideas" to "anon";

grant select on table "public"."board_ideas" to "anon";

grant trigger on table "public"."board_ideas" to "anon";

grant truncate on table "public"."board_ideas" to "anon";

grant update on table "public"."board_ideas" to "anon";

grant delete on table "public"."board_ideas" to "authenticated";

grant insert on table "public"."board_ideas" to "authenticated";

grant references on table "public"."board_ideas" to "authenticated";

grant select on table "public"."board_ideas" to "authenticated";

grant trigger on table "public"."board_ideas" to "authenticated";

grant truncate on table "public"."board_ideas" to "authenticated";

grant update on table "public"."board_ideas" to "authenticated";

grant delete on table "public"."board_ideas" to "service_role";

grant insert on table "public"."board_ideas" to "service_role";

grant references on table "public"."board_ideas" to "service_role";

grant select on table "public"."board_ideas" to "service_role";

grant trigger on table "public"."board_ideas" to "service_role";

grant truncate on table "public"."board_ideas" to "service_role";

grant update on table "public"."board_ideas" to "service_role";


