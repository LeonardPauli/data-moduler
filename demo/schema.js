import {
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
	GraphQLList,
} from 'graphql'

import dataModuler from './dataModuler'
const {getGraphqlQuery} = dataModuler

import modules from './modules'
const {query, mutation} = getGraphqlQuery(modules)

// process.exit(0)

const rawSchema = {
	name: 'Root',
	query: new GraphQLObjectType({
		name: 'RootQuery',
		fields: query,
	}),
	mutation: new GraphQLObjectType({
		name: 'RootMutationQuery',
		fields: mutation,
	}),
}
// rawSchema.query = new GraphQLObjectType({
// 	name: 'RootQuery',
// 	description: 'The starting point for fetching from the API',
// 	// fields: {R: query.AATestEntity},
// 	fields: {
// 		hello: {
// 			type: new GraphQLObjectType({
// 				name: 'AUU',
// 				fields: {lool: {type: GraphQLString, resolve: d=> d.loold}},
// 			}),
// 			resolve: ()=> ({loold: 'aaa'}),
// 		},
// 	},
// })
// rawSchema.mutation = new GraphQLObjectType({
// 	name: 'MainMutation',
// 	description: 'The starting point for posting to the API',
// 	fields: mutation,
// })

// For reference, what's actually created
// Entity
// const entityObject = {
// 	hello: 'world'
// }

// const EntityType = new GraphQLObjectType({
// 	name: 'Entity',
// 	fields: {
// 		getTheHello: {
// 			type: GraphQLString,
// 			resolve: entityObject=> entityObject.hello,
// 		},
// 	},
// })

// // Module list
// const ModuleType = new GraphQLObjectType({
// 	name: 'Module',
// 	fields: {
// 		load: {
// 			type: EntityType,
// 			resolve: ()=> entityObject,
// 		},
// 		list: {
// 			type: new GraphQLList(EntityType),
// 			resolve: ()=> [entityObject, entityObject, entityObject],
// 		},
// 	},
// })

// // Root
// const Root = new GraphQLObjectType({
// 	name: 'Root',
// 	fields: {
// 		Module: {
// 			type: ModuleType,
// 			resolve: ()=> 'loool',
// 		},
// 	},
// })

// rawSchema.query = Root

const Schema = new GraphQLSchema(rawSchema)
export default Schema
