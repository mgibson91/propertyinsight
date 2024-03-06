create table "public"."boards" (
    "tag" uutag not null default gen_random_uutag(),
    "created_at" timestamp with time zone not null default now(),
    "creating_user_tag" uutag not null,
    "name" text not null
);


alter table "public"."boards" enable row level security;

create table "public"."board_columns" (
    "tag" uutag not null default gen_random_uutag(),
    "created_at" timestamp with time zone not null default now(),
    "creating_user_tag" uutag not null,
    "board_tag" uutag not null,
    "title" text not null,
    "position" integer not null
);


alter table "public"."board_columns" enable row level security;

create table "public"."board_items" (
    "tag" uutag not null default gen_random_uutag(),
    "created_at" timestamp with time zone not null default now(),
    "creating_user_tag" uutag not null,
    "title" text not null,
    "position" integer not null,
    "column_tag" uutag not null
);


alter table "public"."board_items" enable row level security;

create table "public"."board_votes" (
    "tag" uutag not null default gen_random_uutag(),
    "created_at" timestamp with time zone not null default now(),
    "item_tag" uutag,
    "user_tag" uutag,
    "count" integer
);


alter table "public"."board_votes" enable row level security;

CREATE UNIQUE INDEX tagx_boards_name ON public.boards USING btree ("name");

CREATE UNIQUE INDEX board_column_pkey ON public.board_columns USING btree (tag);

CREATE UNIQUE INDEX board_items_pkey ON public.board_items USING btree (tag);

CREATE UNIQUE INDEX boards_pkey ON public.boards USING btree (tag);

CREATE UNIQUE INDEX board_votes_pkey ON public.board_votes USING btree (tag);

alter table "public"."boards" add constraint "boards_pkey" PRIMARY KEY using index "boards_pkey";

alter table "public"."board_columns" add constraint "board_column_pkey" PRIMARY KEY using index "board_column_pkey";

alter table "public"."board_items" add constraint "board_items_pkey" PRIMARY KEY using index "board_items_pkey";

alter table "public"."board_votes" add constraint "board_votes_pkey" PRIMARY KEY using index "board_votes_pkey";

alter table "public"."boards" add constraint "boards_creating_user_tag_fkey" FOREIGN KEY (creating_user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."boards" valtagate constraint "boards_creating_user_tag_fkey";

alter table "public"."board_columns" add constraint "board_columns_board_tag_fkey" FOREIGN KEY (board_tag) REFERENCES boards(tag) not valtag;

alter table "public"."board_columns" valtagate constraint "board_columns_board_tag_fkey";

alter table "public"."board_columns" add constraint "board_columns_creating_user_tag_fkey" FOREIGN KEY (creating_user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."board_columns" valtagate constraint "board_columns_creating_user_tag_fkey";

alter table "public"."board_items" add constraint "board_items_column_tag_fkey" FOREIGN KEY (column_tag) REFERENCES board_columns(tag) not valtag;

alter table "public"."board_items" valtagate constraint "board_items_column_tag_fkey";

alter table "public"."board_items" add constraint "board_items_creating_user_tag_fkey" FOREIGN KEY (creating_user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."board_items" valtagate constraint "board_items_creating_user_tag_fkey";

alter table "public"."board_votes" add constraint "board_votes_item_tag_fkey" FOREIGN KEY (item_tag) REFERENCES board_items(tag) not valtag;

alter table "public"."board_votes" valtagate constraint "board_votes_item_tag_fkey";

alter table "public"."board_votes" add constraint "board_votes_user_tag_fkey" FOREIGN KEY (user_tag) REFERENCES auth.users(tag) not valtag;

alter table "public"."board_votes" valtagate constraint "board_votes_user_tag_fkey";

grant delete on table "public"."boards" to "anon";

grant insert on table "public"."boards" to "anon";

grant references on table "public"."boards" to "anon";

grant select on table "public"."boards" to "anon";

grant trigger on table "public"."boards" to "anon";

grant truncate on table "public"."boards" to "anon";

grant update on table "public"."boards" to "anon";

grant delete on table "public"."boards" to "authenticated";

grant insert on table "public"."boards" to "authenticated";

grant references on table "public"."boards" to "authenticated";

grant select on table "public"."boards" to "authenticated";

grant trigger on table "public"."boards" to "authenticated";

grant truncate on table "public"."boards" to "authenticated";

grant update on table "public"."boards" to "authenticated";

grant delete on table "public"."boards" to "service_role";

grant insert on table "public"."boards" to "service_role";

grant references on table "public"."boards" to "service_role";

grant select on table "public"."boards" to "service_role";

grant trigger on table "public"."boards" to "service_role";

grant truncate on table "public"."boards" to "service_role";

grant update on table "public"."boards" to "service_role";

grant delete on table "public"."board_columns" to "anon";

grant insert on table "public"."board_columns" to "anon";

grant references on table "public"."board_columns" to "anon";

grant select on table "public"."board_columns" to "anon";

grant trigger on table "public"."board_columns" to "anon";

grant truncate on table "public"."board_columns" to "anon";

grant update on table "public"."board_columns" to "anon";

grant delete on table "public"."board_columns" to "authenticated";

grant insert on table "public"."board_columns" to "authenticated";

grant references on table "public"."board_columns" to "authenticated";

grant select on table "public"."board_columns" to "authenticated";

grant trigger on table "public"."board_columns" to "authenticated";

grant truncate on table "public"."board_columns" to "authenticated";

grant update on table "public"."board_columns" to "authenticated";

grant delete on table "public"."board_columns" to "service_role";

grant insert on table "public"."board_columns" to "service_role";

grant references on table "public"."board_columns" to "service_role";

grant select on table "public"."board_columns" to "service_role";

grant trigger on table "public"."board_columns" to "service_role";

grant truncate on table "public"."board_columns" to "service_role";

grant update on table "public"."board_columns" to "service_role";

grant delete on table "public"."board_items" to "anon";

grant insert on table "public"."board_items" to "anon";

grant references on table "public"."board_items" to "anon";

grant select on table "public"."board_items" to "anon";

grant trigger on table "public"."board_items" to "anon";

grant truncate on table "public"."board_items" to "anon";

grant update on table "public"."board_items" to "anon";

grant delete on table "public"."board_items" to "authenticated";

grant insert on table "public"."board_items" to "authenticated";

grant references on table "public"."board_items" to "authenticated";

grant select on table "public"."board_items" to "authenticated";

grant trigger on table "public"."board_items" to "authenticated";

grant truncate on table "public"."board_items" to "authenticated";

grant update on table "public"."board_items" to "authenticated";

grant delete on table "public"."board_items" to "service_role";

grant insert on table "public"."board_items" to "service_role";

grant references on table "public"."board_items" to "service_role";

grant select on table "public"."board_items" to "service_role";

grant trigger on table "public"."board_items" to "service_role";

grant truncate on table "public"."board_items" to "service_role";

grant update on table "public"."board_items" to "service_role";

grant delete on table "public"."board_votes" to "anon";

grant insert on table "public"."board_votes" to "anon";

grant references on table "public"."board_votes" to "anon";

grant select on table "public"."board_votes" to "anon";

grant trigger on table "public"."board_votes" to "anon";

grant truncate on table "public"."board_votes" to "anon";

grant update on table "public"."board_votes" to "anon";

grant delete on table "public"."board_votes" to "authenticated";

grant insert on table "public"."board_votes" to "authenticated";

grant references on table "public"."board_votes" to "authenticated";

grant select on table "public"."board_votes" to "authenticated";

grant trigger on table "public"."board_votes" to "authenticated";

grant truncate on table "public"."board_votes" to "authenticated";

grant update on table "public"."board_votes" to "authenticated";

grant delete on table "public"."board_votes" to "service_role";

grant insert on table "public"."board_votes" to "service_role";

grant references on table "public"."board_votes" to "service_role";

grant select on table "public"."board_votes" to "service_role";

grant trigger on table "public"."board_votes" to "service_role";

grant truncate on table "public"."board_votes" to "service_role";

grant update on table "public"."board_votes" to "service_role";


