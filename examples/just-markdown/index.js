// Simple usage of DataModuler


// Setup the moduler (DataModuler) with plugins
import DataModuler, {plugins} from '../../src'
const {markdown} = plugins
const moduler = new DataModuler({
	plugins: [markdown()],
})

// Define the modules (User, Note)
const { allowNull } = moduler.dataFlags
const { STRING } = moduler.dataTypes

const User = {
	fields: {
		name: STRING,
		title: { STRING, allowNull,
			comment: '*ie.* CEO, or Happiness Hero',
		},
	},
}

// const actionInputNormaliser =
// 	({action, args, root: {req: {user}, res}, module})=>
// 		({user, module})

const Note = {
	comment: '*Tips:* Write one note every day in the morning',
	fields: {
		text: STRING,
	},
	// mutations: {
	// 	set: {
	// 		sql: ({module: {type: {sql: model}}})=> model.create('...'),
	// 		vuex: ({module: {name}})=> ({state}, data)=> state.xx = data, // vuex plugin has own normaliser
	// 			// this becomes a mutation called like $store.commit(`${module.name}/set`, data)
	// 		// authorised: ({_user})=> false, // only accessable from actions
	// 	},
	// },
	// actions: {
	// 	create: {
	// 		fn: ({module, user})=> ({text})=> module.mutations.set({text: `${user.name}: ${text}`}),
	// 		authorised: ({user})=> !!user,
	// 	},
	// },
	// fetchers: {
	// 	get: {
	// 		shared: {},
	// 		vuex: ()=> {},
	// 	},
	// },
	// getters: {
			// list: ({get})=> get(`...`),
			// load: {
			// 	fn: (fetchers)=> fetchers.get('...'),
			// 	authorised: '...',
			// },
	// },

}

// Parse the base module (including all the models)
const rawBaseModule = {
	// name: 'BaseModule',
	title: 'Simple, markdown only, demo',
	comment: 'In this example, we got the specs for a note-taking tool.',
	modules: {User, Note},
}
const baseModule = moduler.parse(rawBaseModule)


export default baseModule

// Markdown (export API documentation using baseModule)
baseModule.markdown.writeFile({
	outputFile: `${__dirname}/api-documentation.md`,
})
