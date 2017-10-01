// DataModuler as classes and decorators instead of loose json structures
// created by Leonard Pauli, 1 oct 2017

class Post extends BaseModel {
	submodules = {
		Comment,
	}

	fields = {
		text: String,
		// comments: [Comment]
		comments: {
			type: [Comment],
			allowNull,
		}
	}

	get lala () {
		this.$modules.User.list
	}
}

class RootModule extends BaseModel {
	submodules = {
		Post,
	}

}


@dataModuler.bakeRootModule @mobx @graphql({
	connectToServer: {
		url: '...',
		middlewares: [jwtAuth],
	}
}) @crud @localDB
class RootModuleFrontendWeb extends RootModule {}


const store = new tmpstore.Store()
@markdown({
	flavor: 'thing',
}) @graphql({
	middlewares: [jwtAuth],
}) @crud() @tmpstore(store) 
class RootModuleBackend extends RootModule {}

RootModule.$markdown.writeTo({...})