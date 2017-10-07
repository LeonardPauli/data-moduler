/* eslint-disable */
// use in frontend
import MyAPI from 'my-api'
import {destinations} from 'data-moduler'
const {localDB, asyncStorage, graphql, mobx, markdown} = destinations

// /destinations contains a register of official plugins,
// 	their dependencies aren't installed by default
// 	if their dependencies are installed, it will autodetect and make them available
// 	similar to webpack style-loader and babel plugins
import {jwtAuth} from 'data-moduler/middlewares'
const isReactNative = false
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
