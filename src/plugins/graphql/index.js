import * as rawHelpers from './helpers'
import {
	GraphQLObjectType,
	GraphQLInputObjectType,

	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLString,
	GraphQLID,

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
	ID: 			{ type: GraphQLID },
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
	const input = {}

	type.name = module.name
	type.description = module.description

	input.name = module.name+'Input'
	input.description = type.description
	
	const getFields = (isInput, rawFields={})=> ()=> {
		Object.keys(module.fields).forEach(fieldName=> {
			const field = module.fields[fieldName]
			const newField = rawFields[fieldName] = rawFields[fieldName] || {}

			newField.type = newField.type || field.type[namespace]
			if (isInput && newField.type.getReferenceInputType) {
				const {onlyId, onlyNew} = field
				newField.type = newField.type.getReferenceInputType({onlyId, onlyNew})
			}

			if (!isInput) newField.resolve = newField.resolve
				|| field.type.resolve
				|| (data=> data[fieldName])
			// if (isInput) newField.defaultValue = ...
		})
		return rawFields
	}

	// TODO: add non-static getters
	// TODO: add submodules (no, that's one for module type)

	type.fields = getFields(false, type.fields)
	input.fields = getFields(true, input.fields)

	const objectType = new GraphQLObjectType(type)
	const inputType = new GraphQLInputObjectType(input)
	const idInputType = GraphQLID
	const unionInput = new GraphQLInputObjectType({
		name: module.name+'Reference',
		description: 'Either pass on a reference to an existing'
			+' or create a new by passing its data',
		fields: {
			id: {type: idInputType},
			create: {type: inputType},
		},
	})

	// unions not yet supported as input type
	// const inputReferenceType = new GraphQLUnionType({
	// 	name: type.name+'Reference',
	// 	description: 'Either pass on a reference to an existing or create a new by passing its data',
	// 	types: [
	// 		GraphQLString, // id
	// 		inputType,
	// 	],
	// 	resolveType (value) {
	// 		return typeof value==='string'? GraphQLString: inputType
	// 	},
	// })

	// ie. objectType.getReferenceInputType({onlyId: true}) -> objectType._idInput
	const getGetReferenceInputType = objectType=> ({ onlyId, onlyNew }={})=> {
		const inputType = objectType._input
		const idType = objectType._idInput
		const unionType = objectType._unionInput

		if (onlyId && onlyNew) throw new Error(`dataModuler-${namespace}: `
			+'getReferenceType({onlyId, onlyNew}), both can\'t be false')

		if (onlyId) return idType
		if (onlyNew) return inputType
		return unionType // else, if allowId and allowNew
	}

	objectType._input = inputType
	objectType._idInput = idInputType
	objectType._unionInput = unionInput
	objectType.getReferenceInputType = getGetReferenceInputType(objectType)

	return objectType
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
			const field = action.input[k]
			const ownType = field.type[namespace]
			const {onlyId, onlyNew} = field
			const inputType = ownType.getReferenceInputType
				&& ownType.getReferenceInputType({onlyId, onlyNew})
			ac.args[k] = {type: inputType || ownType}
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
