#!/usr/bin/env sh

# Скрипт для выполненеи операция при редиплое приложения

echo 'Load envs'
export $(grep -v "^#" .env | xargs)
echo 'Make database backup'
[ -d dumps ] || mkdir dumps
# shellcheck disable=SC2046
docker compose run -it -e PGPASSWORD="$DB_PASSWORD" postgres pg_dumpall -c -U "$DB_USER" -h postgres > ./dumps/dump_$(date +%d-%m-%Y"_"%H_%M_%S).sql
echo 'Pull updates'
docker compose pull
echo 'Run migrations'
docker compose run -it server npm run migrate:prod
echo 'Start application'
docker compose up -d --remove-orphans
