// Simple usage of DataModuler


// Setup the moduler (DataModuler) with plugins
import DataModuler, {plugins} from '../../src'
const {sequelize, graphql, markdown} = plugins
const moduler = new DataModuler({
	plugins: [
		sequelize(),
		graphql(),
		markdown({ outputFile: `${__dirname}/api-documentation.md` }),
	],
})

// Define the modules (User, Post)
const { allowNull } = DataModuler.dataFlags
const { STRING } = DataModuler.dataTypes

const User = {
	fields: {
		name: STRING,
		title: { STRING, allowNull },
	},
}

const Post = {
	fields: {
		text: STRING,
	},
}

// Parse the base module (including all the models)
const rawBaseModule = { modules: {User, Post} }
const baseModule = moduler.parse(rawBaseModule)


// Markdown (export API documentation using baseModule)
baseModule.markdown.writeFile()

// Sequelize (setup database models using baseModule)
import Sequelize from 'sequelize'
const connection = new Sequelize({ ... })
baseModule.sequelize.attach(connection)
// baseModule.User.sequelize.model === baseModule.sequelize.models.User

// GraphQL (define API schema using baseModule)
const schema = baseModule.graphql.schema // GraphQLSchema


// Setup express
import express from 'express'
const app = express()

// Understand JSON in body
import bodyParser from 'body-parser'
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Serve GraphQL endpoint using express
import GraphHTTP from 'express-graphql'
app.use('/graphql', GraphHTTP({
	schema,
	pretty: true,
	graphiql: true,
	rootValue: {baseModule}, // important for all default logic
}))


// Start serving
const APP_PORT = 3044
app.listen(APP_PORT, ()=> console.log(`serving at localhost:{APP_PORT}`)})