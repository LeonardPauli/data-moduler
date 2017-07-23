import Sequelize from 'sequelize'
// import _ from 'lodash'
// import Faker from 'faker'
import dataModuler from './dataModuler'
const {defineModels} = dataModuler

import modules from './modules'

export const connection = new Sequelize({
	database: 'mydb',
	username: 'postgres',
	password: 'postgres',
	dialect: 'postgres',
	host: 'localhost',
})

export const models = defineModels(connection, modules)

// Relationships
// Thing.hasOne(OtherThing)
// Thing.hasMany(OtherThing)
// Thing.hasOne(OtherThing, {as: 'keyName'})
// Thing.belongsTo(OtherThing)
// Thing.belongsTo(OtherThing, {as: 'otherKeyName'})

connection.sync({force: true}).then(()=> {

	// Seeding
	// _.times(10, ()=>{
	// 	return models.Thing.create({
	// 		name: Faker.name.findName(),
	// 	}).then(Thing =>{
	// 		return models.Thing.createOtherThing({
	// 			name: `Sample name from ${Thing.name}`,
	// 		})
	// 	})
	// })

})

