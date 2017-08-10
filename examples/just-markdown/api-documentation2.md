# DemoAPI; Simple, markdown only, demo
In this example, we got the specs for a note-taking tool.


### Setup local environment
... // postgres setup, etc?
... // setup .env file with credentials, etc


### GraphGL
You'll find the credentials in the .env file

- GraphiQL: [local](.../graphiql) - [stageing](.../graphiql) - [production](.../graphiql)
- Endpoint: [local](.../graphql) - [stageing](.../graphql) - [production](.../graphql)


### Rest
- BaseURL: [local](.../api) - [stageing](.../api) - [production](.../api)


### CRUD Operations
...


### Authorisation
- ...


## Modules

- [User](#user)
  - [Color](#color)
- [Note](#note), *Tips:* Write one note every day in the morning

---
### User

| Field | Type            | Comment                      |
|-------|-----------------|------------------------------|
| rang1 | [Color](#color) |                              |
| rang2 | [Color](#color) |                              |
| name  | STRING          |                              |
| title | STRING?         | *ie.* CEO, or Happiness Hero |

#### Actions

###### Mutations

- __create__: [User](#user) *static*
	> general comment
	>
	> **name:** STRING some comment about the input field
	> **title:** STRING?
	
	rest: POST [/users](/users)

- __update__: [User](#user)
	> general comment
	>
	> **name:** STRING some comment about the input field
	> **title:** STRING?
	> **returns:** the updated user (comment about return type)
	
	rest: PATCH [/users/:id](/users/:id)

- __delete__: [User](#user)
	rest: DELETE [/users/:id](/users/:id)
	
###### Getters

- __load__: [User](#user)
- __list__: many [User](#user) *static*

---
### Color

| Field | Type   | Comment |
|-------|--------|---------|
| hex   | STRING |         |

---
### Note
*Tips:* Write one note every day in the morning

| Field | Type          | Comment |
|-------|---------------|---------|
| text  | STRING        |         |
| user  | [User](#user) |         |