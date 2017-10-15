// @flow
/* eslint class-methods-use-this:0 */
import {type DataTypeType} from './dataTypes'

export default class DataModule {
	static _isModule = true
	static get _isEntity () {
		return Object.keys(this.fields).length > 0
	}
	static documentationNote = undefined
	static documentationURL = undefined
	
	static fields = {}
	static submodules = {}
	static actions = {}
	static getters = {}

	static constraints = []
	$validate () { /**/ }

	$beforeCreate () { /**/ }
	$beforeUpdate () { /**/ }
	$beforeDelete () { /**/ }

	static moduleModifications = []

	// static toString (opt) {
	// 	const {rawCode} = opt
	// 	if (rawCode) return super.toString()
	// 	return this.name
	// }

	static validate (value, opt = {}) {
		// $FlowFixMe
		return validateAgainstFields(this.fields)(value, {Module: this, ...opt})
	}

	static allSubmodules () {
		return Object.keys(this.submodules).map(k=> this.submodules[k])
			.reduce((a, Module)=> [...a, Module, ...Module.allSubmodules()], [])
	}

	static get actionContext () {
		return {
			...this.actions,
			...this.getters,
			...this.fields,
			Module: this,
			// input
			// self
		}
	}
}
export type DataModuleType = DataModule
export type DataModuleClassType = typeof DataModule

export const validateAgainstFields = <validateOpt: *>(
	fields: {[string]: DataTypeType<*, validateOpt>}
)=> (value: *, opt: validateOpt)=> {
	// if (typeof value==='function')
	// 	value = value(opt)

	if (typeof value!=='object')
		throw new Error(`expected object, got ${typeof value}`)

	const val = {}
	Object.keys(fields).forEach(fieldName=> {
		const type = fields[fieldName]
		const rawValue = value[fieldName]
		// TODO: catch ValidationError, add field info (fieldName)
		// 	and save -> re-throw an AggregatedValidationError
		val[fieldName] = type.validate(rawValue, opt)
	})

	return val
}


// TODO: sql plugin, add to model:
// static get tabelName () {
// 	return this.name
// 		.replace(/^[A-Z]/, l=> l.toLowerCase())
// 		.replace(/[A-Z]/g, l=> '_'+l.toLowerCase())
// }
