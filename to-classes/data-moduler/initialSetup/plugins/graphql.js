import {
	GraphQLObjectType,
	GraphQLInputObjectType,

	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLString,
	GraphQLID,

	GraphQLList,
	GraphQLNonNull,
} from 'graphql'


import {plugins, dataTypes, flags} from '../index'
const {Plugin, registerPlugin} = plugins
const {ID, STRING, BOOLEAN, DATE, INT, DECIMAL} = dataTypes
// const {isStatic, allowNull, onlyNew} = flags


@registerPlugin
class GraphQLPlugin extends Plugin {
	static namespace = 'graphql'

	static didRegister () {

		// hook up types
		ID			.addConverter({ type: GraphQLID })
		STRING	.addConverter({ type: GraphQLString })
		BOOLEAN	.addConverter({ type: GraphQLBoolean })
		DATE		.addConverter({ type: GraphQLString })
		INT			.addConverter({ type: GraphQLInt })
		DECIMAL	.addConverter({ type: GraphQLFloat })

	}

	static apply (module) {
		const {namespace} = this

		if (!module.$crud || !module.$crud.enabled) return

		module.$crud.addMiddleware({
			namespace,
			load: ctx=> ctx.next(),
			list: ctx=> ctx.next(),
			create: ctx=> ctx.next(),
			update: ctx=> ctx.next(),
			delete: ctx=> ctx.next(),
		})
	}

	static documentation = {
		title: 'graphql - API Exposer with a graph query language',
		description: 'ie. instead of REST API. Supports CRUD plugin.'
		+' See localhost/graphql if [GraphiQL](https://github.com/graphql/graphiql) is enabled.',
	}
}
