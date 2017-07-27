# DemoAPI; Simple, markdown only, demo
In this example, we got the specs for a note-taking tool.


## Modules

- [User](#user)
  - [Color](#color)
- [Note](#note), *Tips:* Write one note every day in the morning


### User

| Field | Type            | Comment                      |
|-------|-----------------|------------------------------|
| rang1 | [Color](#color) |                              |
| rang2 | [Color](#color) |                              |
| name  | STRING          |                              |
| title | STRING?         | *ie.* CEO, or Happiness Hero |


### Color

| Field | Type   | Comment |
|-------|--------|---------|
| hex   | STRING |         |


### Note
*Tips:* Write one note every day in the morning

| Field | Type          | Comment |
|-------|---------------|---------|
| text  | STRING        |         |
| user  | [User](#user) |         |