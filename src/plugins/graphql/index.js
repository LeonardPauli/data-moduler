import * as helpers from './helpers'
import {
	GraphQLObjectType,

	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLString,

	GraphQLList,
	// GraphQLNonNull,
} from 'graphql'


const dataTypes = {
	STRING: 	{ type: GraphQLString },
	BOOLEAN: 	{ type: GraphQLBoolean },
	DATE: 		{ type: GraphQLString },
	INT: 			{ type: GraphQLInt },
	DECIMAL: 	{ type: GraphQLFloat },
	LIST: 		{ type: GraphQLList, of: ({ ownInnerType })=> props=>
		new GraphQLList(ownInnerType(props)),
	},
}


const initialiseModule = _moduler=> module=> {
	module.graphql = Object.assign({}, module.graphql)
}



const typeReducer = module=> {
	const type = {}

	type.name = module.name
	type.description = module.description
	
	const rawFields = type.fields || {}
	Object.keys(module.fields).forEach(fieldName=> {
		const field = module.fields[fieldName]
		const newField = rawFields[fieldName] = rawFields[fieldName] || {}
		newField.type = newField.type || field.type.graphql
		newField.resolve = newField.resolve || field.type.resolve || (data=> data[fieldName])
	})
	type.fields = ()=> rawFields

	return new GraphQLObjectType(type)
}


// actionsFixer
const actionsFixer = ({module, actions})=> {
	// const {graphql: {type}} = module
	const fixed = {}

	Object.keys(actions).forEach(actionName=> {
		const action = actions[actionName]
		const ac = fixed[actionName] = {}
		
		ac.type = action.type.graphql

		ac.args = {}
		Object.keys(action.params).forEach(k=> {
			ac.args[k] = {type: action.params[k].type.graphql}
		})

		// eslint-disable-next-line
		ac.resolve = (root, args, req, {rootValue})=> action.resolve({
			action: actionName, args, root, module, req, rootValue,
		})
	})
	
	return fixed
}

const gettersGenerator = module=> {
	module.graphql.getters = actionsFixer({
		module, actions: module.getters})
}

const actionsGenerator = module=> {
	module.graphql.actions = actionsFixer({
		module, actions: module.actions})
}


// moduleTypeGenerator
// const moduleTypeGenerator = module=> {
// 	const entity = {}
// 	entity.name = module.name
// 	entity.description = module.description

// 	console.dir({T: module.fields})
// 	entity.fields = {}
// 	Object.keys(module.fields).map(fieldName=> {
// 		const field = module.fields[fieldName]
// 		entity.fields[fieldName] = {
// 			type: field.type.graphql,
// 			resolve: field.resolve,
// 		}
// 	})

// 	return new GraphQLObjectType(entity)
// }



export default {
	namespace: 'graphql',
	initialiseModule,
	
	dataTypes,
	typeReducer,
	gettersGenerator,
	actionsGenerator,
	helpers,
}
