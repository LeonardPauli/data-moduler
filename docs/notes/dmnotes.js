types.email = types.string.extend({validator: ()=> true, $name: 'email', $alias: [...]})
types.email.description -> "primitive.string.email"



const User = module({
	$name: 'User',
	
	name: String,
	email: types.string.extend({allowNull, validator: ()=> true})
	email: types.email.extend({allowNull}),
	email: {email, allowNull},

	friends: types.late(({Self})=> {Array, of: Self, default: []})
	posts: ({me, models})=> models.Post.list({ user: me }),


	$static: {
		list: ({Self, gundb})=> ({ })=> gundb.get('')
	},
})