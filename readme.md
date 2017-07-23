# Data-Moduler

Automatic generation of database models, rest endpoints and graphql api (all with validations, ease of authentisation and fully customizable) from simple specification \"module\" files

A Node / Express / GraphQL / Sequelize / Postgres project
(although plugins for other data stores etc could be written relatively easily)

Created by Leonard Pauli, July 2017


## Get started

1. Install [nodejs](https://nodejs.org/en/download/) (Runtime)
2. Install [postgres](https://www.postgresql.org/download/) (DBMS / database)
3. Install [yarn](https://yarnpkg.com/en/) (Package manager)
4. Make sure you've started postgress and have database setup (username/password/database name) as requested in `src/db.js`
5. Git clone this project [wh](https://www.google.se/search?q=git+clone+tutorial)[at](http://rogerdudler.github.io/git-guide/)
6. Open terminal, cd into the folder [what](https://askubuntu.com/questions/520778/how-can-i-change-directories-in-the-terminal)
7. > yarn install
8. > yarn dev
9. open the `src` folder in your editor, or install [Sublime Text](https://www.sublimetext.com/3) and open the `data-moduler.sublime-project` with it
10. open [localhost:3020/graphql](http://localhost:3020/graphql)
11. View its documentation and try some queries [what](http://graphql.org/learn/) [mutations](http://graphql.org/learn/queries/)
12. Edit the source, look in ie. `src/modules/Test.js`
13. Restart the server (`ctrl + c` in the terminal, followed by `yarn dev` again), and reload the webpage, to try your changes (database will be erased in between)


## Todo

- [x] Basic/primitive types (with comments)
- [x] Nested modules
- [x] Basic markdown plugin
- [ ] Relation type (normaliser + markdown)
- [ ] Mutations/fetchers (normaliser + markdown + tmpstore
	(just store in memory store, mostly as base for other stores))
- [ ] Actions/getters (normaliser + markdown)
- [ ] Basic GraphQL
	(schema, graphiql, nested modules, primitive types, comments, actions/getters)
- [ ] GraphQL relation types
- [ ] CRUD (markdown + tmpstore + graphql)
- [ ] express-rest plugin (endpoints)
- [ ] express-rest support with markdown plugin
	(shouldn't need to know about each other though... express-rest write to some documentation field on model?)
- [ ] sequelize plugin
- [ ] access-control / authorised field
- [ ] vuex code generation (not in memory construction, write to file for now)
- [ ] dataloader functionality (ie. don't make unnecessary db queries)
