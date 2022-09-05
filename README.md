# News API

## Local Setup

After cloning and pulling down the repo:

Add the following files to create the necessary environment variables:
- in the root directory add a .env.development file and add the following to the file - PGDATABASE=nc_news
- in the root directory add a .env.test file and add the following to the file - PGDATABASE=nc_news_test
- ensure both of these files are included in .gitignore

Install npm and dependencies:
- npm i
- ensure node_modules is included in .gitignore

Run the following scripts:
- npm run setup-dbs
- npm run seed