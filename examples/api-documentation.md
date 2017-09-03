# DemoAPI; Simple, markdown only, demo
In this example, we got the specs for a note-taking tool.


### tmpstore - Temporary storage (caching)
By saving all data on the heap, native to JavaScript, this store becomes very fast - until it exceeds the available RAM - or restarts, which inherently removes all the data. Supports CRUD plugin.


### crud - Auto-add CRUD actions
CRUD stands for Create, Read, Update, and Delete. In this case, it adds default mutations (create, update, delete) and getters (load, list), together with a hook for other plugins to provide their own default CRUD actions in a standardized way. This makes it possible to automatically chain multiple plugins. Ie. if one store plugin is added, then a validation plugin, followed by an API exposer (ie rest/graphql), followed by the crud plugin, calling create on the API will automatically first validate the input, and then call create on the store.


### graphql - API Exposer with a graph query language
ie. instead of REST API. Supports CRUD plugin. See localhost/graphql if [GraphiQL](https://github.com/graphql/graphiql) is enabled.


## Modules

- [User](#user), Everyone accessing the system are users, even bots
  - [Color](#color)
- [Note](#note), *Tips:* Write one note every day in the morning



---
### User
Everyone accessing the system are users, even bots

| Field | Type          | Comment                      |
|-------|---------------|------------------------------|
| lal   | [User](#user) |                              |
| name  | STRING        |                              |
| thing | [Note](#note) |                              |
| rang1 | Color         |                              |
| rang2 | Color         |                              |
| title | STRING        | *ie.* CEO, or Happiness Hero |
| id    | ID            |                              |

#### Actions

###### Mutations

- __create__: User
  > **item:** User
  > **returns:** If ok or not

- __update__: User
  > **id:** ID
  > **item:** User

- __delete__: BOOLEAN
  > **id:** ID

###### Getters

- __load__: User
  > **id:** ID

- __list__: [User]
  > Has filter ability
  >
  > **q:** UserFilter



---
### Color

| Field | Type   | Comment |
|-------|--------|---------|
| hex   | STRING |         |
| id    | ID     |         |

#### Actions

###### Mutations

- __create__: Color
  > **item:** Color
  > **returns:** If ok or not

- __update__: Color
  > **id:** ID
  > **item:** Color

- __delete__: BOOLEAN
  > **id:** ID

###### Getters

- __load__: Color
  > **id:** ID

- __list__: [Color]
  > Has filter ability
  >
  > **q:** ColorFilter



---
### Note
*Tips:* Write one note every day in the morning

| Field | Type   | Comment |
|-------|--------|---------|
| text  | STRING |         |
| col   | Color  |         |
| user  | User   |         |
| id    | ID     |         |

#### Actions

###### Mutations

- __create__: Note
  > **item:** Note
  > **returns:** If ok or not

- __update__: Note
  > **id:** ID
  > **item:** Note

- __delete__: BOOLEAN
  > **id:** ID

###### Getters

- __anUppercaseText__: STRING

- __uppercaseText__: STRING *non-static*

- __load__: Note
  > **id:** ID

- __list__: [Note]
  > Has filter ability
  >
  > **q:** NoteFilter
