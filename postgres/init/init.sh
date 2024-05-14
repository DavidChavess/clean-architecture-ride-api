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
EOSQL