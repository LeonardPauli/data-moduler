# DemoAPI; Simple, markdown only, demo
In this example, we got the specs for a note-taking tool.


### tmpstore - Temporary storage (caching)
By saving all data on the heap, native to JavaScript, this store becomes very fast - until it exceeds the available RAM - or restarts, which inherently removes all the data. Supports CRUD plugin.


### crud - Auto-add CRUD actions
CRUD stands for Create, Read, Update, and Delete. In this case, it adds default mutations (create, update, delete) and getters (load, list), together with a hook for other plugins to provide their own default CRUD actions in a standardized way. This makes it possible to automatically chain multiple plugins. Ie. if one store plugin is added, then a validation plugin, followed by an API exposer (ie rest/graphql), followed by the crud plugin, calling create on the API will automatically first validate the input, and then call create on the store.


### graphql - API Exposer with a graph query language
ie. instead of REST API. Supports CRUD plugin. See localhost/graphql if [GraphiQL](https://github.com/graphql/graphiql) is enabled.


## Modules

- [Post](#post)
- [Comment](#comment)


---
### Post

| Field | Type   | Comment |
|-------|--------|---------|
| text  | STRING |         |
| id    | ID     |         |

#### Actions

###### Mutations

- __create__: Post
  > **item:** Post
  > **returns:** If ok or not

- __update__: Post
  > **id:** ID
  > **item:** Post

- __delete__: BOOLEAN
  > **id:** ID

###### Getters

- __comments__: BOOLEAN *non-static*

- __load__: Post
  > **id:** ID

- __list__: [Post]
  > Has filter ability
  >
  > **q:** PostFilter



---
### Comment

| Field | Type   | Comment |
|-------|--------|---------|
| text  | STRING |         |
| post  | Post   |         |
| id    | ID     |         |

#### Actions

###### Mutations

- __create__: Comment
  > **item:** Comment
  > **returns:** If ok or not

- __update__: Comment
  > **id:** ID
  > **item:** Comment

- __delete__: BOOLEAN
  > **id:** ID

###### Getters

- __load__: Comment
  > **id:** ID

- __list__: [Comment]
  > Has filter ability
  >
  > **q:** CommentFilter
