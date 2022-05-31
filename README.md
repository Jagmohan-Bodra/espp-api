# README

This is the API Backend for the ESPP Projects

Version 1.0.1

## Some useful command?

```yml
# To Run the APIs server http://127.0.0.1:3000
npm run start

# To run the consumer and watch the change to re-load the application
npm run watch-consumer

# To monitor the projet and re-build when any code change happen
npm run watch

# To clean the project build
npm run clean

# To run format the code following the team conventions
npm run format

# To check the coding conventions and some basic mistake.
npm run lint

# To Run the Unit, Integration test
npm run test

# To build the project for Production
npm run build

# To run project on Production
npm run serve

# To run consumer on production
npm run consume
```

## Dependancies

This project use:

- Mongo DB to store the data and content
- Redis as a cache service

To run this project you can:

- Option 1: Update the `.env` to correct with your environment variable.
- Option 2: Use docker-compose to up and run dependancies, then all config in `.env` will matched with the docker-compose's environment variable

This is some useful docker-compose command:

```yml
# To up and run a single docker container
cd <this project root>
docker-compose up -d <name of container in yaml>

# To show container log
docker-compose logs -f <name of container in yaml>

# To SSH to inside a container
docker-compose exec -ti <name of container in yaml> bash
```

## Contribution guidelines

- Naming a commit

  > Feature => [feat] - description

  > Update => [update] - description

  > Fix bug => [fixed] - description

  > Refactor => [refactor] - description

  > Docs => [docs] - description

- Naming a folder

  > lowercase & using - to separator word
  > ex: user-profile

- Naming a file

  > uppercase first letter
  > ex: CreateSegmentPage.jsx

- Naming a function
  > camelCase
