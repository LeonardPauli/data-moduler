// Created by Leonard Pauli, July 2017
// Copyright Leonard Pauli, All rights reserved

import Sequelize from 'sequelize'
import {
	GraphQLObjectType,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLString,
	GraphQLList,
	GraphQLNonNull,
} from 'graphql'

import helper from './helper'
const {
	allowNull,
	STRING,
	useId,
} = helper

const actionPathGenerator = ({key})=> key.replace(/[A-Z]/g, l=> '-'+l.toLowerCase())
if (useId) {
	item.params.id = INT,
	const {path} = item
	item.path = opt=> `:id/`+actionPathGenerator(opt)
	// -${module.name}
}

// export module
export default {
	name: 'Model',
	tabelName: 'demo_models',
	description: 'An example, try some things with it.',
	fields: {
		note: STRING,
		note: { STRING },
		note: { STRING(30) },
		note: { type: {
			sql: Sequelize.STRING(30),
			graphql: GraphQLString,
		} },
		note: { STRING, allowNull },
		note: { STRING,
			get: (data, {key})=> data[key],
			set: ...,
		}
	},
	// root is graphql rootValue or {req, res} if express
	// tip: set rootValue to {req, res} for unified experience
	// locked down by default
	// args are Object.assign({}, req.params, req.query, req.body, )
	authorised: ({user})=> user.priviisdsdfsdf.indexOf(prividfsdf.admin)
	authorised: async ({action, args, root: {req: {user}, res}, module})=> false
	authorised: async ({action, args, root: {req: {user}, res}, module})=> ({
		list: true,
		update: 
	})[action],

	// checked in typeReducer, namespace is plugin.namespace
	ignore: ({fieldSectionName, namespace})=> fieldSectionName==='mutations' && namespace!='graphql'

	getters: {
		// available by default: list
		// to disable, set
		list: null,
		list: {
			method: 'GET',
			path: '',
		},
	},
	
	actions: {
		// generally the same as getters
		// available by default: create, update, remove
		load: {
			method: 'GET',
			path: ':id',
		},
		create: {
			method: 'POST',
			path: '',
		},
		update: {
			method: 'POST',
			path: ':id',
		},
		remove: {
			method: 'DELETE',
			params: { id: INT },
			path: ':id',
		},
		myCustomAction: {
			// graphql key is same as js key
			path: actionPathGenerator,
			path: 'my-custom-action',
		},
		myCustomAction: {
			useId,
		},
		params: { id: INT },
		path: ':id-Model/my-custom-action',
	}
}

// User.mutations.create.graphql.middlewares = [
// 	(context, input, next)=> next(context, {...input, addedField: 123}),
// 	(context, input, next)=> next(context, {...input, addedField: input.addedField-100})
// ]







// Relations

// no - first read all modules fields, keep list of them all,
// 	error if same name, write back name to raw + set isModel: true,
// 	then check if field has isModule, then use name field to connect
// const Teacher = {
// 	fields: {
// 		name: STRING,
// 		colors: {
// 			name: 'TeacherColor',
// 			fields: {
// 				name: STRING,
// 			}
// 		}
// 	},
// }
const Teacher = {
	modules: {
		TeacherColor: {
			fields: {
				name: STRING,
			}
		},
		// TeacherColor.fields: {
		// 	name: STRING,
		// },
	},
	fields: {
		name: STRING,
		colors: TeacherColor,
	},
}

// import Teacher from './Teacher'
const Student = {
	fields: {
		name: STRING,
		teacher: Teacher,
	},
}

moduler.parse({
	modules: {Teacher, Student}
})





import Pack from './pack'

// User
// 	- name: String
// 	- shortName: String
// 		authorised: ...
// 	authorised: ...
// 	mutations:
// 		- copyNameFromUser: Self
// 			input:
// 				useSelf // - self: Self
// 				- otherUser: Self
// 			- sql: ...
// 			- graphql: ...


const User = {
	fields: {
		name: STRING,
		shortName: {
			type: STRING,
			authorised: ({user, forMutation})=> forMutation
				? user.insider?.privileges.admin
				: true
		},
	},
	authorised: ({user, forMutation})=> forMutation // generally
		? user.insider?.privileges.admin
		: true
	mutations: {
		copyNameFromUser: {
			input: ({User})=> OBJECT.of({ // like fields
				SELF,	// special; provide it to the action separately
				otherUser: User,
			}),
			type: SELF,
			sql: ({models}, self)=> ({otherUser: {name}})=> {
				self.sql.name = name
				return self.sql.save()
			},
			graphql: ({sql}, self)=> ({otherUser})=> sql(otherUser),
		}
	},
	getters: {
		packs: {
			input: SELF,
			type: LIST.of(Pack), // type is return type
			sql: ({models})=> ()=> models.Pack // param 2; input
				.where('user.id is :id', {id: user.id})
				.where('user.id is :id', {id: user.id})
				.where('user.id is :id', {id: user.id}),
			graphql: async ({sql})=> {
				const packs = await sql()
				return packs.map(x=> ...)
			},
		}
	}
}