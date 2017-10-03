export default class DataModule {
	static _isModule = true
	
	static fields = {}
	static submodules = {}
	static actions = {}
	static getters = {}

	static constraints = []
	$validate () {}

	$beforeCreate () {}
	$beforeUpdate () {}
	$beforeDelete () {}

	static moduleModifications = []

	// static toString (opt) {
	// 	const {rawCode} = opt
	// 	if (rawCode) return super.toString()
	// 	return this.name
	// }

	static validate (value, opt = {}) {
		return validateAgainstFields(this.fields)(value, {Module: this, ...opt})
	}
}

export const validateAgainstFields = fields=> (value, opt = {})=> {
	// if (typeof value==='function')
	// 	value = value(opt)

	if (typeof value!=='object')
		throw new Error(`expected object, got ${typeof value}`)

	const val = {}
	Object.keys(fields).forEach(fieldName=> {
		const type = fields[fieldName]
		const rawValue = value[fieldName]
		val[fieldName] = type.validate(rawValue, opt)
	})

	return val
}
