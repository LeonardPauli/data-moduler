export default class DataModule {
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
}
