import {modulate} from 'data-moduler'
import {BaseModel} from './BaseModel'
import User from './User'


@modulate
export default class Post extends BaseModel {
	static fields = {
		...super.fields,
		// targetField is used to auto-setup reverse getters etc
		user: {User, targetField: 'posts',
			// if function, pass in context
			// if default isn't a function and is === null, allowNull
			default: ({currentUser})=> currentUser,
		},
		// ability to provide custom options to type
		text: {String, maxLength: 140},
		// if default, replace null/undefined input with default
		private: {Boolean, default: true},
	}

	$beforeCreate ({currentUser}) {
		if (currentUser || !this.user) this.user = currentUser
		super.beforeCreate()
	}
}


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