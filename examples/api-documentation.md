# DemoAPI; Simple, markdown only, demo
In this example, we got the specs for a note-taking tool.


### tmpstore - Temporary storage (caching)
By saving all data on the heap, native to JavaScript, this store becomes very fast - until it exceeds the available RAM - or restarts, which inherently removes all the data.


## Modules

- [User](#user), Everyone accessing the system are users, even bots
  - [Color](#color)
- [Note](#note), *Tips:* Write one note every day in the morning


---
### User
Everyone accessing the system are users, even bots

| Field | Type            | Comment                      |
|-------|-----------------|------------------------------|
| name  | STRING          |                              |
| rang1 | [Color](#color) |                              |
| title | STRING?         | *ie.* CEO, or Happiness Hero |

#### Actions

###### Mutations

- __create__: STRING *static*
  > **name:** STRING
  > **returns:** If ok or not

  tmpstore: Note from a plugin

- __update__
  > **name:** STRING

- __delete__

###### Getters

- __load__

- __list__ *static*
  > Has filter ability
  >
  > **q:** STRING? Filter name



---
### Color

| Field | Type   | Comment |
|-------|--------|---------|
| hex   | STRING |         |

#### Actions

###### Mutations

- __create__: STRING *static*
  > **name:** STRING
  > **returns:** If ok or not

  tmpstore: Note from a plugin

- __update__
  > **name:** STRING

- __delete__

###### Getters

- __load__

- __list__ *static*
  > Has filter ability
  >
  > **q:** STRING? Filter name



---
### Note
*Tips:* Write one note every day in the morning

| Field | Type          | Comment |
|-------|---------------|---------|
| text  | STRING        |         |
| user  | [User](#user) |         |

#### Actions

###### Mutations

- __create__: STRING *static*
  > **name:** STRING
  > **returns:** If ok or not

  tmpstore: Note from a plugin

- __update__
  > **name:** STRING

- __delete__

###### Getters

- __load__

- __list__ *static*
  > Has filter ability
  >
  > **q:** STRING? Filter name
