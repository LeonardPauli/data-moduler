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