const dataTypes = {}
export default dataTypes

class DataType {
	// could be used to dynamically match, eg. see MODULE data type
	// 	or for native type aliases, eg. see STRING data type
	static matchesRawType (key, value) {
		if (value instanceof this) return true
		if (key==this.name) return this
		return false
	}


	static addConverter ({ target, targetName, from, to }) {
		const name = targetName || (target && target.name)
		if (!name) throw new Error(`${this.name}.addConverter: name is missing`)

		if (target) Object.defineProperty(this, `$${name}`, { value: target })
		if (to) Object.defineProperty(this.prototype, `to${name}`, { value: to })
		if (from) Object.defineProperty(this.prototype, `from${name}`, { value: from })
	}
}

Object.defineProperty(dataTypes, 'DataType', { value: DataType })
Object.defineProperty(dataTypes, 'findMatchingType', { value: (key, value)=>
	dataTypes.asList.find(d=> d.matchesRawType(key, value)) })


const registerDataType = dataType=> {
	if (!(dataType instanceof DataType))
		throw new Error(`dataType wasn't instanceof DataType`)

	const {name} = dataType
	if (typeof name !== 'string' || name.length==0)
		throw new Error('name required')

	if (dataTypes[name]) {
		if (dataTypes[name]==dataType) return
		throw new Error(`different dataType with name ${name} already registered`)
	}

	// const {allAliases} = dataTypes
	// const duplicateAliases = dataType.aliases.filter(a=> allAliases.indexOf(a)>=0)
	// if (duplicateAliases.length)
	// 	throw new Error(`dataType.aliases(${duplicateAliases}) has `
	// 		+`already been taken by other data type`)

	dataTypes[name] = dataType
}

Object.defineProperty(dataTypes, 'registerDataType', { value: registerDataType })

Object.defineProperty(dataTypes, 'asList', { get: ()=>
	Object.keys(dataTypes).map(k=> dataTypes[k]) })
// Object.defineProperty(dataTypes, 'allAliases', { get: ()=>
// 	dataTypes.asList.reduce((a, d)=> a.concat(d.aliases), []) })
