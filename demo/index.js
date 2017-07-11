import GraphHTTP from 'express-graphql'
import bodyParser from 'body-parser'
import express from 'express'

import schema from './schema'
import {models} from './db'

const APP_PORT = 3020
const app = express()

// Understand JSON in body
app.use(bodyParser.urlencoded({
	extended: true,
}))
app.use(bodyParser.json())


// use graphql
app.use('/graphql', GraphHTTP({
	schema,
	pretty: true,
	graphiql: true,
	rootValue: {models},
}))


// start
app.listen(APP_PORT, ()=> {
	// eslint-disable-next-line
	console.log(`app listening on port ${APP_PORT}`)
})
