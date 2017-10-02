// DataModuler as classes and decorators instead of loose json structures
// created by Leonard Pauli, 1 oct 2017

// use in backend
import MyAPI from 'my-api'
import {destinations} from 'data-moduler'
const {graphql, markdown} = destinations

@markdown @graphql
class MyAPIBackend extends MyAPI {}

// computed, or recalculate? (ie. with .get()?)
MyAPIBackend.$graphql.schema
MyAPIBackend.$graphql.objectType
MyAPIBackend.$graphql.filterInputType
MyAPIBackend.$graphql.inputType
