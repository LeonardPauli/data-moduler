import {plugins, dataTypes, flags, performModuleModification, destinations} from '../index'
const {Plugin, registerPlugin} = plugins
const {registerDestination} = destinations
const {STRING} = dataTypes
const {registerFlag} = flags


// Example of destination types. These can be whatever the destination
// library provides (ie just object instead of classes or whatever)
class MyMaybeType {
	innerType
	constructor (type) {
		if (typeof type !== 'function')
			throw new Error(`MyMaybe requires type as class, got ${typeof value}`)
		this.innerType = type
	}

	validate (value) {
		if (value===null || value===void 0) return null
		return this.innerType.validate(value)
	}
}
class MyStringType {
	validate (value) {
		if (typeof value !== 'string')
			throw new Error(`MyString requires non-null string, got ${typeof value}`)
		if (value[0]!=='!') // example of custom type...
			throw new Error(`first char should be !, got ${value[0]}`)
		return value
	}
}


@registerPlugin
export default class MyExamplePlugin extends Plugin {
	static namespace = 'myexample'
	static targetName = 'MyExample'

	static didRegister () {
		// plugin has been validated and added to
		// 	{plugins[namespace]} from 'data-moduler'

		// add flags
		registerFlag('myFlag', {someDefault: 'value'})
		registerFlag('myOtherFlag', 3)
		// used to simplify setup; ie
		// field: {String, allowNull}
		// instead of;
		// field: new STRING({allowNull: true})

		// hook up types
		const {targetName: name} = this
		STRING.addConverter({
			name, // <- the only required field, all other are for your convenience
			type: MyStringType,
			
			// ie. toDestinationType, fromDestinationType
			// eg. used for GraphQL to generate the schema
			toType () {
				return this.allowNull
					? new MyMaybeType(MyStringType)
					: new MyStringType()
			},
			fromType: myType=> myType instanceof MyMaybeType
				? new STRING({allowNull: true})
				: new STRING({allowNull: false}),

			// ie. toDestinationValue, fromDestinationValue
			to: value=> '!'+value, // this is source type instance, ie. new STRING(...)
			from: myValue=> myValue.substr(1),

			// initial thought:
			// throw on conversion error
			// here the validate functions will both validate the value and return it if
			// toValidated: (type, value, toType, to)=> toType(type).validate(to(value)),
			// fromValidated: (myType, myValue, fromType, from)=>
			// 	fromType(myType).validate(from(myValue)),
		})

		/* this allows you to write
		STRING.$MyExample === MyStringType // true
		const stringType = new STRING({allowNull: true})
		
		const myStringType = stringType.asMyExample // => new MyMaybeType(MyStringType)
		STRING.newFromMyExample(myStringType) // => ~stringType / new STRING({allowNull: true})

		const myVal = stringType.toMyExample('hello') // => '!hello'
		const val = stringType.fromMyExample(myVal) // => 'hello'
		*/
	

		// register destinations
		registerDestination(this)
		// requires namespace and getActionContext
	}

	static getActionContext = action=> context=> (...customArgs)=> {
		const newContext = {...context, args: customArgs}
		if (action.isGetter) newContext.argsss = true
		return newContext
	}


	static getSayHello = Module=> (phrase = 'Hello')=>
		`${phrase} ${Module.name}!`

	static apply (Module) {
		// creates and returns Module.$myexample = {enabled: true}
		const opt = super.apply(Module)
		if (!opt.enabled) return

		// add properties / methods to opt
		opt.usefulProp = 'very useful constant'
		opt.sayHello = this.getSayHello(Module)

		// perform module modifications
		performModuleModification(Module, {
			getters: {
				sayHello: { // add or alter the non-static sayHello getter on the module
					type: STRING,
					input: {phrase: STRING},
					fn: context=> context.Module.$myexample.sayHello(context.input.phrase),
				},
			},
		})

		// add module modifications requiring other modules as dependencies
		// 	in order for them to initialise first
		Module.moduleModifications = [...Module.moduleModifications, {
			requiredPlugins: ['crud'],
			requiredModules: [Module],
			modify: ({_modules, _plugins})=> {
				// if (!Module.$crud.enabled) return
				// Module.$crud.helloFromMyExample = true

				Module.getters.sayHello.addDestination({
					name: this.namespace,
					fn: context=> context.action.fn(context)+'lalal',
				})
			},
		}]
	}

	static documentation = {
		title: 'A great startingpoint for any new plugin for data-moduler',
		description: 'It has it all, just get your copy, modify it, push it, include it, and profit!',
		url: 'https://datamoduler.co/plugins/create',
	}
}
