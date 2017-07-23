import dataModuler from '../dataModuler'
const {modulesParser} = dataModuler

import TestEntity from './TestEntity'
import User from './User'

const modules = modulesParser({
	TestEntity,
	User,
})

// console.dir(modules, {colors: 1, depth: 6})
// process.exit(0)

export default modules
