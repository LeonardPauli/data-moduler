import {DataModule} from 'data-moduler'

export default class DataModuleEmpty extends DataModule {
	static fields = {
		...super.fields,
		
	}
	static submodules = {
		...super.submodules,
		
	}
	static actions = {
		...super.actions,
		
	}
	static getters = {
		...super.getters,
		
	}

	static constraints = [...super.constraints, {

	}]
	$validate () {
		super.$validate()

	}

	$beforeCreate () {
		super.$beforeCreate()

	}
	$beforeUpdate () {
		super.$beforeUpdate()

	}
	$beforeDelete () {
		super.$beforeDelete()

	}

	static modelModifications = [...super.modelModifications, {

	}]
}
