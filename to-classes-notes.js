// DataModuler as classes and decorators instead of loose json structures
// created by Leonard Pauli, 1 oct 2017

import {DataModule, modulate, flags, dataTypes, ValidationError} from 'data-moduler'
import {crud, relations} from 'data-moduler/plugins'
const {allowNull, unique} = flags
const {ID} = dataTypes

@modulate({use: [crud, relations]})
class MyAPI extends DataModule {
	static fields = {
	}

	static submodules = {
		User,
	}
}


class BaseModel extends DataModule {
	static fields = {
		uuid: {ID, kind: 'UUID-44', unique},
		createdAt: Date,
		updatedAt: {Date, allowNull},
		deletedAt: {Date, allowNull},
	}

	beforeCreate () {
		super.beforeCreate()
		this.createdAt = new Date()
	}

	beforeUpdate () {
		super.beforeUpdate()
		this.updatedAt = new Date()
	}

	beforeDelete (req, res) {
		super.beforeDelete()
		this.deletedAt = new Date()
		res.preventDelete()
	}
}

@modulate
class User extends BaseModel {
	static fields = {
		...super.fields,
		name: String,
		length: Number, // cm
		following: {type: [User], default: [], targetField: 'follows'},
	}

	static actions = {

	}

	static getters = {

	}

	// @computed
	// get lengthInCm () {
	// 	return this.length / 100
	// }

	// @computed lengthInCm = ({length})=> length / 100

	// @action grow = self=> self.length += 100
	
	// @action({
	// 	tmpstore: ()=> ...
	// })
	// grow = self=> self.length += 100 
}

class Friendship extends BaseModel {
	static fields = {
		...super.fields,
		userA: User,
		userB: User,
		status: ['request', 'requestDeclined', 'approved']
	}

	validate () {
		super.validate()
		if (this.userA == this.userB)
			throw new ValidationError('this.userA == this.userB')
	}

	static constraints = [
		unique(['userA', 'userB']),
	]

	static modelModifications = [
	...super.modelModifications, {
		model: User,
		getters: {
			friends: 'self(userA=target or userB=target)'
		}
	}]
}

@modulate
class Post extends BaseModel {
	static fields = {
		...super.fields,
		user: {User, targetField: 'posts'},
		text: {String, maxLength: 140, allowNull},
		private: {Bool, default: true},
	}
}


// use in backend
import MyAPI from 'my-api'
import {graphql, markdown} from 'data-moduler/destinations'

@markdown @graphql
class MyAPIBackend extends MyAPI {}

// computed, or recalculate? (ie. with .get()?)
MyAPIBackend.$graphql.schema
MyAPIBackend.$graphql.objectType
MyAPIBackend.$graphql.filterInputType
MyAPIBackend.$graphql.inputType


// use in frontend
import MyAPI from 'my-api'
import {localDB, asyncStorage, graphql, mobx, markdown} from 'data-moduler/destinations'
// /destinations contains a register of official plugins,
// 	their dependencies aren't installed by default
// 	if their dependencies are installed, it will autodetect and make them available
// 	similar to webpack style-loader and babel plugins
import {jwtAuth} from 'data-moduler/middlewares'
const localStorage = isReactNative? asyncStorage: localDB

@markdown @mobx @graphql({
	connect: {
		url: '...'
	},
	middlewares: [jwtAuth]
}) @localStorage
class MyAPIFrontend extends MyAPI {}

// computed, or recalculate? (ie. with .get()?)
MyAPIFrontend.$graphql.execute`...graphql lang using appolo or similar...`


// class Post extends BaseModel {
// 	submodules = {
// 		Comment,
// 	}

// 	fields = {
// 		text: String,
// 		// comments: [Comment]
// 		comments: {
// 			type: [Comment],
// 			allowNull,
// 		}
// 	}

// 	get lala () {
// 		this.$modules.User.list
// 	}
// }

// class RootModule extends BaseModel {
// 	submodules = {
// 		Post,
// 	}

// }


// @dataModuler.bakeRootModule @mobx @graphql({
// 	connectToServer: {
// 		url: '...',
// 		middlewares: [jwtAuth],
// 	}
// }) @crud @localDB
// class RootModuleFrontendWeb extends RootModule {}


// const store = new tmpstore.Store()
// @markdown({
// 	flavor: 'thing',
// }) @graphql({
// 	middlewares: [jwtAuth],
// }) @crud() @tmpstore(store) 
// class RootModuleBackend extends RootModule {}

// RootModule.$markdown.writeTo({...})