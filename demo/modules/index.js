import dataModuler from '../dataModuler'
const {modulesParser} = dataModuler

import TestEntity from './TestEntity'

const modules = modulesParser({
	TestEntity,
})

// console.dir(modules, {colors: 1, depth: 6})
// process.exit(0)

export default modules
