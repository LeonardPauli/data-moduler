import {
	GraphQLObjectType,
	GraphQLSchema,
} from 'graphql'

import dataModuler from './dataModuler'
const {getGraphqlQuery} = dataModuler

import modules from './modules'
const {query, mutation} = getGraphqlQuery(modules)

console.dir({query}, {colors:1, depth:20})
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

const Schema = new GraphQLSchema(rawSchema)
export default Schema
