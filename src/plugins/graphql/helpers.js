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
			
			const actionCategoryName = isActions?'mutations':'getters'
			entity.fields = {}
			Object.assign(entity.fields, module.graphql[actionCategoryName])


			if (Object.keys(entity.fields).length==0) {
				entity.fields.empty = {type: GraphQLString, args: {}, resolve: ()=> true}
				console.warn('dataModuler; graphql plugin; '
					+ `no ${actionCategoryName} defined for ${moduleName}`)
			}
			
			// var s = GraphQLObjectType
			// debugger;
			endpoints[moduleName] = {
				type: new GraphQLObjectType(entity),
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
