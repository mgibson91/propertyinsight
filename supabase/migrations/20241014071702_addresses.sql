create schema if not exists "postgis";

create extension if not exists "postgis" with schema "postgis" version '3.3.2';

-- Create type geometry_dump if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geometry_dump') THEN
        CREATE TYPE "postgis"."geometry_dump" AS (
            "path" integer[],
            "geom" postgis.geometry
        );
    END IF;
END $$;

-- Create type valid_detail if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'valid_detail') THEN
        CREATE TYPE "postgis"."valid_detail" AS (
            "valid" boolean,
            "reason" character varying,
            "location" postgis.geometry
        );
    END IF;
END $$;

alter table "public"."addresses" add column "coordinates" postgis.geography(Point,4326);

CREATE INDEX addresses_geo_index ON public.addresses USING gist (coordinates);


