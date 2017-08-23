import {
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql'

export const getSchema = defaults=> (module, options={})=> {
	const opt = Object.assign({
		raw: false,
	}, defaults, options)
	const {raw} = opt

	// getEndpoints
	const getEndpoints = (modules, isActions)=> {
		const endpoints = {}
		Object.keys(modules).forEach(moduleName=> {
			const module = modules[moduleName]
			const entity = {}
			
			entity.name = module.name+(isActions?'Actions':'Module')
			entity.description = module.comment
			
			const fieldSectionName = isActions?'mutations':'getters'
			entity.fields = {}
			// only add static actions, non-static actions are attached on the non-module ObjectType
			const actions = module.graphql[fieldSectionName]
			Object.keys(actions).forEach(k=> {
				const action = actions[k]
				if (action.isStatic) return // only static ones
				entity.fields[k] = action
			})


			// warn if no actions are defined. Should be ie.
			// create/load/list actions/getters to get the actual object.
			if (Object.keys(entity.fields).length==0) {
				entity.fields.empty = {type: GraphQLString, args: {}, resolve: ()=> true}
				console.warn('dataModuler; graphql plugin; '
					+ `no ${fieldSectionName} defined for ${moduleName}`)
			}
			
			// var s = GraphQLObjectType
			// debugger;
			endpoints[moduleName] = {
				type: new GraphQLObjectType(entity),
					// ie. UserModule -> UserModule.create -> User (ie. module.type.graphql) -> user.name
				resolve: ()=> true,
			}
		})
		return endpoints
	}

	const endpoints = {}
	endpoints.query = getEndpoints(module.modules, false)
	endpoints.mutation = getEndpoints(module.modules, true)

	// console.dir({graphqlhelpers: endpoints.query}, {colors:1, depth:9})

	// process.exit()
	if (raw) return endpoints

	return new GraphQLSchema({
		name: module.title,
		query: new GraphQLObjectType({
			name: 'RootQuery',
			fields: endpoints.query,
		}),
		mutation: new GraphQLObjectType({
			name: 'RootMutationQuery',
			fields: endpoints.mutation,
		}),
	})
}


// moduleQueryTypeGenerator
// const moduleQueryTypeGenerator = module=> {
// 	const query = {}
// 	query.name = module.name
// 	query.description = module.description
// 	query.fields = module.graphql.getters
// 	// module.graphql.actions

// 	return new GraphQLObjectType(query)
// }

// moduleQueryTypeGenerator()
