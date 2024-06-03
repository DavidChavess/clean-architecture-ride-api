#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE SCHEMA cccat15;
  CREATE TABLE cccat15.account (
    account_id uuid primary key,
    name text not null,
    email text not null,
    cpf text not null,
    car_plate text null,
    is_passenger boolean not null default false,
    is_driver boolean not null default false
  );
  CREATE TABLE cccat15.ride (
    ride_id uuid,
    passenger_id uuid,
    driver_id uuid,
    status text,
    fare numeric,
    distance numeric,
    from_lat numeric,
    from_long numeric,
    to_lat numeric,
    to_long numeric,
    date timestamp
  );
  CREATE TABLE cccat15.position (
    position_id uuid,
    ride_id uuid,
    lat numeric,
    long numeric,
    date timestamp
  );
EOSQL