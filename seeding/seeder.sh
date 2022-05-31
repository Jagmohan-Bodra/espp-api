#!/bin/bash
MONGODB__CONNECTION_STRING="mongodb://user:passwww3@127.0.0.1:27017/dbtest?authSource=admin&readPreference=primary&ssl=false"

for file in ./seeding/staging/*
do
  FILENAME=$(echo $file | cut -d'/' -f 4 | cut -d'.' -f 1)
  mongoimport --uri=$MONGODB__CONNECTION_STRING --collection=${FILENAME} --file=${file} --jsonArray --drop
  echo "------------------------------ ${FILENAME} ---------------------------------------------"
done