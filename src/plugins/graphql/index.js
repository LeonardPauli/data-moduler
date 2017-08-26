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
	GraphQLNonNull,
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
		const fieldSectionName = isInput? 'mutations': 'getters'
		Object.keys(module.fields).forEach(fieldName=> {
			const field = module.fields[fieldName]
			const ignore = field.ignore && field.ignore({namespace, fieldSectionName})
			if (ignore) return

			const newField = rawFields[fieldName] = rawFields[fieldName] || {}

			newField.type = newField.type || field.type[namespace]
			if (isInput && newField.type.getReferenceInputType) {
				const {onlyId, onlyNew} = field
				newField.type = newField.type.getReferenceInputType({onlyId, onlyNew})
			}

			if (!field.allowNull[fieldSectionName])
				newField.type = new GraphQLNonNull(newField.type)
			// if (isInput) newField.defaultValue = ... // if value is null (allowNull req.)

			if (!isInput) {
				const primitiveFieldResolver = data=> data[fieldName]
				const typeModule = field.type._module
				const moduleFieldResolver = (parent, args, req, {rootValue})=> {
					const self = parent
					return typeModule.getters.load[namespace](self)
						.native({parent, args, req, rootValue})
						// in this case, parent and args are probably superfluous
				}

				newField.resolve = newField.resolve
					|| field.type.resolve
					|| typeModule
						? moduleFieldResolver
						: primitiveFieldResolver
						// ({hex: "SJSJ", id:1212}) // TODO: load child
			}
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
const actionsFixer = ({module, fieldSectionName})=> {
	// const {graphql: {type}} = module
	const actions = module[fieldSectionName]
	const fixed = {}

	Object.keys(actions).forEach(actionName=> {
		const action = actions[actionName]
		const ignore = action.ignore && action.ignore({namespace, fieldSectionName})
		if (ignore) return

		const ac = fixed[actionName] = {}
		
		// add return type
		// console.dir({action, type: action.type.type.type.type}, {depth:3, colors:1})
		// TODO; that's way to many 'type'... RIGHT, it's because of that MODULE.of code..
		ac.type = (action.type && action.type // the field
				// ie. action.type: STRING || {STRING, allowNull} || {type: STRING, allowNull: true}
			.type[namespace] // action.type.type (ie. not .allowNull), then .graphql to get the actual type
		) || GraphQLBoolean // needs a type
		
		if (!action.type.allowNull[fieldSectionName])
			ac.type = new GraphQLNonNull(ac.type)

		// add arguments
		ac.args = {}
		if (action.input) Object.keys(action.input).forEach(k=> {
			const field = action.input[k]
			const ownType = field.type[namespace]
			const {onlyId, onlyNew} = field
			const inputType = ownType.getReferenceInputType
				&& ownType.getReferenceInputType({onlyId, onlyNew})
			const arg = ac.args[k] = {type: inputType || ownType}

			if (!field.allowNull[fieldSectionName])
				arg.type = new GraphQLNonNull(arg.type)
		})

		// from graphql: (root, args, req, {rootValue})
		// eslint-disable-next-line
		ac.resolve = (parent, args, req, {rootValue})=> action[namespace]
			.native({parent, args, req, rootValue})
	})
	
	return fixed
}


// afterTypeSetup
const afterTypeSetup = module=> {
	module[namespace].getters 	= actionsFixer({module, fieldSectionName: 'getters'})
	module[namespace].mutations = actionsFixer({module, fieldSectionName: 'mutations'})
}


const crud = {
	actions: {
		create: ({nextPlugin})=> (_context, _input)=> {
			const handleCreateDirective = getHandleCreateDirectiveMiddleware(namespace)
			const {context, input} = handleCreateDirective(_context, _input)
			const {thisAction} = context
			return thisAction[nextPlugin.namespace](input.item, context)
		},
		load: ({nextPlugin})=> (context, input)=> {
			const {thisAction, self} = context
			return thisAction[nextPlugin.namespace](self)(input, context)
		},
	},
}



const createDirectiveItemTransformer = (context, item, create)=> {
	const {thisAction} = context
	const newItem = {...item}

	const returnModule = thisAction.type.type._module
	if (!returnModule) return newItem

	// if a create is requested (field: {create: {...}}), do it
	const {fields} = returnModule
	Object.keys(fields).forEach(k=> {
		const field = fields[k]
		const fieldModule = field.type._module
		if (!fieldModule) return // skip primitives
		
		const ref = newItem[k]
		if (!ref) return // skip non-relevant
		if (typeof ref!=='object') return // all ok already, ie. id
		if (ref.id) return // reference is there

		const item = ref.create
		if (!item) throw new Error('data-moduler: crud-plugin: '
			+'id or create required on InputReference') // something wrong?

		// create the item and put back as it includes its reference
		newItem[k] = create(fieldModule, item, context)
	})

	return newItem
}

const getHandleCreateDirectiveMiddleware = pluginNamespace=> (context, input)=> {
	const create = (fieldModule, item, context)=>
		fieldModule.mutations.create[pluginNamespace]({item}, context)

	return {context, input: {
		...input,
		item: createDirectiveItemTransformer(context, input.item, create),
	}}
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

const actionsWrapper = (context, fn)=> fn({
	...context,
	//store: context.moduler[namespace].store,
}, context.input.args)

const actionsInputNormaliser = (input, context)=> {
	const {parent, req, rootValue} = context
	return {parent, req, rootValue, args: input}
}

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
			wrapper: actionsWrapper,
			inputNormaliser: actionsInputNormaliser,
		},

		helpers,
		moduleHelpers,

		crud,
	}
}
