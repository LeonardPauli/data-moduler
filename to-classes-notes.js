/* eslint-disable */

// DataModuler as classes and decorators instead of loose json structures
// created by Leonard Pauli, 1 oct 2017

// use in backend
import MyAPI from 'my-api'
import {graphql, markdown, registerDestination} from 'data-moduler/destinations'

@markdown @graphql
class MyAPIBackend extends MyAPI {}

// computed, or recalculate? (ie. with .get()?)
MyAPIBackend.$graphql.schema
MyAPIBackend.$graphql.objectType
MyAPIBackend.$graphql.filterInputType
MyAPIBackend.$graphql.inputType


// use in frontend
import MyAPI from 'my-api'
import {localDB, asyncStorage, graphql, mobx, markdown} from 'data-moduler/destinations'
// /destinations contains a register of official plugins,
// 	their dependencies aren't installed by default
// 	if their dependencies are installed, it will autodetect and make them available
// 	similar to webpack style-loader and babel plugins
import {jwtAuth} from 'data-moduler/middlewares'
const localStorage = isReactNative? asyncStorage: localDB

@markdown @mobx @graphql({
	connect: {
		url: '...',
	},
	middlewares: [jwtAuth],
}) @localStorage
class MyAPIFrontend extends MyAPI {}

// computed, or recalculate? (ie. with .get()?)
MyAPIFrontend.$graphql.execute`...graphql lang using appolo or similar...`
