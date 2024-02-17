create table "public"."boards" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


alter table "public"."boards" enable row level security;

create table "public"."board_columns" (
    "created_at" timestamp with time zone not null default now(),
    "board_id" uuid not null,
    "title" text not null,
    "position" integer not null,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."board_columns" enable row level security;

create table "public"."board_items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "position" integer not null,
    "column_id" uuid not null
);


alter table "public"."board_items" enable row level security;

create table "public"."board_votes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "item_id" uuid,
    "user_id" uuid,
    "count" integer
);


alter table "public"."board_votes" enable row level security;

CREATE UNIQUE INDEX idx_board_column_position ON public.board_columns USING btree (board_id, "position");

CREATE UNIQUE INDEX idx_board_items_position ON public.board_items USING btree (column_id, "position");

CREATE UNIQUE INDEX idx_boards_name ON public.boards USING btree ("name");

CREATE UNIQUE INDEX board_column_pkey ON public.board_columns USING btree (id);

CREATE UNIQUE INDEX board_items_pkey ON public.board_items USING btree (id);

CREATE UNIQUE INDEX boards_pkey ON public.boards USING btree (id);

CREATE UNIQUE INDEX board_votes_pkey ON public.board_votes USING btree (id);

alter table "public"."boards" add constraint "boards_pkey" PRIMARY KEY using index "boards_pkey";

alter table "public"."board_columns" add constraint "board_column_pkey" PRIMARY KEY using index "board_column_pkey";

alter table "public"."board_items" add constraint "board_items_pkey" PRIMARY KEY using index "board_items_pkey";

alter table "public"."board_votes" add constraint "board_votes_pkey" PRIMARY KEY using index "board_votes_pkey";

alter table "public"."board_columns" add constraint "board_columns_board_id_fkey" FOREIGN KEY (board_id) REFERENCES boards(id) not valid;

alter table "public"."board_columns" validate constraint "board_columns_board_id_fkey";

alter table "public"."board_items" add constraint "board_items_column_id_fkey" FOREIGN KEY (column_id) REFERENCES board_columns(id) not valid;

alter table "public"."board_items" validate constraint "board_items_column_id_fkey";

alter table "public"."board_votes" add constraint "board_votes_item_id_fkey" FOREIGN KEY (item_id) REFERENCES board_items(id) not valid;

alter table "public"."board_votes" validate constraint "board_votes_item_id_fkey";

alter table "public"."board_votes" add constraint "board_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."board_votes" validate constraint "board_votes_user_id_fkey";

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


