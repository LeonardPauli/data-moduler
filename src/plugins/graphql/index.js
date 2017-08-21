import * as rawHelpers from './helpers'
import {
	GraphQLObjectType,

	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLString,

	GraphQLList,
	// GraphQLNonNull,
} from 'graphql'



// namespace
const namespace = 'graphql'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])

	// optionally setup default CRUD mutation/fetcher adapters
}



// dataTypes
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



// typeReducer
const typeReducer = module=> {
	const type = {}

	type.name = module.name
	type.description = module.description
	
	const rawFields = type.fields || {}
	Object.keys(module.fields).forEach(fieldName=> {
		const field = module.fields[fieldName]
		const newField = rawFields[fieldName] = rawFields[fieldName] || {}
		newField.type = newField.type || field.type[namespace]
		newField.resolve = newField.resolve || field.type.resolve || (data=> data[fieldName])
	})

	// TODO: add non-static getters
	// TODO: add submodules (no, that's one for module type)

	type.fields = rawFields // or ()=> rawFields

	return new GraphQLObjectType(type)
}


// actionsFixer
const actionsFixer = ({module, actions})=> {
	// const {graphql: {type}} = module
	const fixed = {}

	Object.keys(actions).forEach(actionName=> {
		const action = actions[actionName]
		const ac = fixed[actionName] = {}
		
		// add return type
		// console.dir({action, type: action.type.type.type.type}, {depth:3, colors:1})
		// TODO; that's way to many 'type'... RIGHT, it's because of that MODULE.of code..
		ac.type = (action.type && action.type // the field
				// ie. action.type: STRING || {STRING, allowNull} || {type: STRING, allowNull: true}
			.type[namespace] // action.type.type (ie. not .allowNull), then .graphql to get the actual type
		) || GraphQLBoolean // needs a type

		// add arguments
		ac.args = {}
		if (action.input) Object.keys(action.input).forEach(k=> {
			ac.args[k] = {type: action.input[k].type[namespace]}
		})

		// eslint-disable-next-line
		ac.resolve = (root, args, req, {rootValue})=> action.resolve({
			action: actionName, args, root, module, req, rootValue,
		})
	})
	
	return fixed
}


// afterTypeSetup
const afterTypeSetup = module=> {
	module[namespace].getters 	= actionsFixer({module, actions: module.getters})
	module[namespace].mutations = actionsFixer({module, actions: module.mutations})
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
// 			type: field.type[namespace],
// 			resolve: field.resolve,
// 		}
// 	})

// 	return new GraphQLObjectType(entity)
// }



// export default {
// 	namespace: 'graphql',
// 	initialiseModule,
	
// 	dataTypes,
// 	typeReducer,
// 	gettersGenerator,
// 	actionsGenerator,
// 	helpers,
// }

export default function GraphQLPlugin (defaults) {

	// get helpers
	const helpers = {}
	const moduleHelpers = {}
	Object.keys(rawHelpers).forEach(k=> {
		helpers[k] = rawHelpers[k](defaults)
		moduleHelpers[k] = module=> options=> rawHelpers[k](defaults)(module, options)
	})

	return {
		namespace,

		initialiseModule,
		dataTypes,
		typeReducer,
		afterTypeSetup,

		actions: {
			mutationWrapper: (context, fn)=> fn(context),
			fetcherWrapper: (context, fn)=> fn(context),
		},

		helpers,
		moduleHelpers,
	}
}
