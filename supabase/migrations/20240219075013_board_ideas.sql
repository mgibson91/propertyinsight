alter table "public"."board_votes" drop constraint "board_votes_item_tag_fkey";

create table "public"."board_tageas" (
    "tag" uutag not null default gen_random_uutag(),
    "created_at" timestamp with time zone not null default now(),
    "requesting_user_tag" uutag not null,
    "board_tag" uutag not null,
    "title" text not null,
    "description" text not null
);


alter table "public"."board_tageas" enable row level security;

CREATE UNIQUE INDEX board_tageas_pkey ON public.board_tageas USING btree (tag);

alter table "public"."board_tageas" add constraint "board_tageas_pkey" PRIMARY KEY using index "board_tageas_pkey";
alter table "public"."board_tageas" add constraint "board_tageas_board_tag_fkey" FOREIGN KEY (board_tag) REFERENCES boards(tag) not valtag;

alter table "public"."board_tageas" valtagate constraint "board_tageas_board_tag_fkey";

alter table "public"."board_tageas" add constraint "board_tageas_requesting_user_tag_fkey" FOREIGN KEY (requesting_user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."board_tageas" valtagate constraint "board_tageas_requesting_user_tag_fkey";

alter table "public"."board_votes" add constraint "board_votes_item_tag_fkey" FOREIGN KEY (item_tag) REFERENCES board_items(tag) ON DELETE CASCADE not valtag;

alter table "public"."board_votes" valtagate constraint "board_votes_item_tag_fkey";

grant delete on table "public"."board_tageas" to "anon";

grant insert on table "public"."board_tageas" to "anon";

grant references on table "public"."board_tageas" to "anon";

grant select on table "public"."board_tageas" to "anon";

grant trigger on table "public"."board_tageas" to "anon";

grant truncate on table "public"."board_tageas" to "anon";

grant update on table "public"."board_tageas" to "anon";

grant delete on table "public"."board_tageas" to "authenticated";

grant insert on table "public"."board_tageas" to "authenticated";

grant references on table "public"."board_tageas" to "authenticated";

grant select on table "public"."board_tageas" to "authenticated";

grant trigger on table "public"."board_tageas" to "authenticated";

grant truncate on table "public"."board_tageas" to "authenticated";

grant update on table "public"."board_tageas" to "authenticated";

grant delete on table "public"."board_tageas" to "service_role";

grant insert on table "public"."board_tageas" to "service_role";

grant references on table "public"."board_tageas" to "service_role";

grant select on table "public"."board_tageas" to "service_role";

grant trigger on table "public"."board_tageas" to "service_role";

grant truncate on table "public"."board_tageas" to "service_role";

grant update on table "public"."board_tageas" to "service_role";


