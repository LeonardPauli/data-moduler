import {
	GraphQLObjectType,
} from 'graphql'

export const getGraphqlQuery = modules=> {

	// getEndpoints
	const getEndpoints = (modules, isActions)=> {
		const endpoints = {}
		Object.keys(modules).forEach(moduleName=> {
			const module = modules[moduleName]
			const entity = {}
			
			entity.name = module.name+(isActions?'Actions':'Module')
			entity.description = module.description
			
			entity.fields = {}
			Object.assign(entity.fields, module.graphql[isActions?'actions':'getters'])
			
			endpoints[moduleName] = {
				type: new GraphQLObjectType(entity),
				resolve: ()=> true,
			}
		})
		return endpoints
	}

	const endpoints = {}
	endpoints.query = getEndpoints(modules, false)
	endpoints.mutation = getEndpoints(modules, true)

	// console.dir({graphqlhelpers: endpoints.query}, {colors:1, depth:9})

	// process.exit()
	return endpoints
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
