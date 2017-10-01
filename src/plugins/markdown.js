// namespace
const namespace = 'markdown'

// initialiseModule
const initialiseModule = _moduler=> module=> {
	module[namespace] = Object.assign({}, module[namespace])

	// optionally setup default CRUD mutation/fetcher adapters
}


// const myCustomTypes = {
// 	CString: 'string',
// 	CBoolean: 'boolean',
// 	CDate: 'date',
// 	CInt: 'int',
// 	CDecimal: 'float',
// 	CList: function CList (innerType) {
// 		this.innerType = innerType
// 	},
// 	CObject: function CObject (obj) {
// 		this.obj = obj
// 	},
// }
// const {CString, CBoolean, CDate, CInt, CDecimal, CList, CObject} = myCustomTypes

// dataTypes
// const dataTypes = {
// 	STRING: 	{ type: CString },
// 	BOOLEAN: 	{ type: CBoolean },
// 	DATE: 		{ type: CDate },
// 	INT: 			{ type: CInt },
// 	DECIMAL: 	{ type: CDecimal },
// 	LIST: 		{ type: CList, of: ({ ownInnerType })=> props=>
// 		new CList(ownInnerType(props)),
// 	},
// }


// helpers
const mdIndent = '  '

const limitStrLength = (str, n=100)=>
	str.length>n ? str.substr(0, n-3)+'...' : str

const mdLink = (text, link)=> link
	?	`[${text}](${link})`
	: text

const getTypeName = type=> {
	const formatterWrapper = (type, formatter=(t=> t))=> {
		const suffix = type.allowNull && type.allowNull.default?'?':'' // TODO: allowNull is different
		return {type, formatter: (text=type.name)=> formatter(text)+suffix}
	}
	if (type.markdown) return {type, formatter: ()=> type.markdown.title}
	if (type.isList) {
		const {type: innerType, formatter} = getTypeName(type.ofType)
		return formatterWrapper(innerType, text=> `[${formatter(text)}]`)
	}
	if (type._module) return formatterWrapper(type._module)
	return formatterWrapper(type)
}

const mdTypeLink = field=> {
	const {type, formatter} = getTypeName(field.type)
	return formatter(mdLink(type.name, type.documentationURL))
}

const tableFromRows = rows=> {
	const headerRowsCount = 1

	// helpers
	const repeatStr = (str=' ', n=10)=> Array(Math.max(0, n)).fill(str).join('')
	const stringifyRows = rows=> rows.map(cols=> cols.map((col, i)=> col
		.replace(/\|/g, '\\|') + repeatStr(' ', maxColLengths[i]-col.length)))
		.map(cols=> `| ${cols.join(' | ')} |`).join('\n')

	// setup
	const maxColLengths = rows.map(cols=> cols.map(str=> str.length))
		.reduce((sums, cols)=> cols.forEach((count, i)=>
			sums[i] = Math.max(sums[i]||0, count)) || sums, [])

	// header
	const header = stringifyRows(rows.slice(0, headerRowsCount))
		+ '\n|'+maxColLengths.map(n=> repeatStr('-', n+2)).join('|')+'|'

	// rows
	const body = stringifyRows(rows.slice(headerRowsCount))

	return '\n'+header+'\n'+body
}


// addActionsGroup (md section)
const getAddActionsGroup = doc=> (title, actions)=> {
	const actionNames = Object.keys(actions)
	if (!actionNames.length) return

	doc.push(`###### ${title}`)
	doc.push('')

	actionNames.forEach(actionName=> {
		const action = actions[actionName]
		const {type, isStatic, comment, input, returnTypeDescription, rawActions} = action
		const returnType = type
			? `: ${mdTypeLink(type)}`
			: ''
		const mdStatic = isStatic?'': ' *non-static*'

		const inputNames = input? Object.keys(input): []
		
		doc.push(`- __${actionName}__${returnType}${mdStatic}`) // title
		if (comment) doc.push(`${mdIndent}> ${comment}`) // general comment
		if (comment && (inputNames.length || returnTypeDescription))
			doc.push(`${mdIndent}>`) // break

		// input fields
		inputNames.forEach(name=> doc.push(`${mdIndent}> **${name}:** ${mdTypeLink(input[name])}`
			+ (input[name].comment?' '+input[name].comment:''))) // comment

		if (returnTypeDescription) // returns comment
			doc.push(`${mdIndent}> **returns:** ${returnTypeDescription}`)

		// plugins
		const pluginNames = Object.keys(rawActions)
		const pluginsSection = pluginNames
			.map(name=> [name, rawActions[name].comment]).filter(([_, t])=> t)
			.map(([name, comment])=> `${mdIndent}${name}: ${comment}`)
			.join('\n')

		if (pluginsSection) {
			doc.push('')
			doc.push(pluginsSection)
		}

		// end break
		doc.push('')
	})
}


// getModuleMDTypeToMDString
const getModuleMDTypeToMDString = type=> ({
	isBase,
	sectionAfterDescription='',
}={})=> {
	const {
		title, description,
		fieldsTable, // titleInList, subtitleInList,
		modules,
		actions,
	} = type
	
	const doc = []
	const addBreak = n=> Array(n).fill('').forEach(v=> doc.push(v))

	if (!isBase) {
		doc.push('### '+title) // title
		if (description) doc.push(description) // description
		if (fieldsTable) doc.push(tableFromRows(fieldsTable)) // fieldsTable
		if (sectionAfterDescription.length) { // sectionAfterDescription
			addBreak(1); doc.push(sectionAfterDescription)
		}

		// actions
		if (actions) {
			addBreak(1)
			doc.push('#### Actions')
			addBreak(1)

			const addActionsGroup = getAddActionsGroup(doc)
			addActionsGroup('Mutations', actions.mutations) // Mutations
			addActionsGroup('Getters', actions.getters) // Getters
			// doc.pop() // remove last break
		}

		return doc.join('\n')
	}


	doc.push('# '+title) // title
	if (description) doc.push(description) // description

	if (sectionAfterDescription.length) { // sectionAfterDescription
		addBreak(2); doc.push(sectionAfterDescription)
	}

	// plugins sections
	// #### Setup environment ...
	// #### GraphQL ...
	// #### CRUD Operations ...
	// #### Authorisation ...

	if (modules) { // modules
		addBreak(2)
		doc.push('## Modules')
		addBreak(1)

		// append module outline + get flatten list
		const allModules = []
		const indentation = '  '
		const walk = (modules, prefix='')=> modules.map(module=> {
			allModules.push(module)
			const title = prefix+'- '+module.titleInList
			const slug = limitStrLength(module.subtitleInList, 100)
			return title+slug
				+ (!module.modules? '': '\n'+walk(module.modules, prefix+indentation))
		}).join('\n')
		const modulesOutline = walk(modules)
		doc.push(modulesOutline)
		
		// append module sections
		allModules.forEach(module=> {
			addBreak(2)
			doc.push('---')
			doc.push(module.toString())
		})
	}

	return doc.join('\n')
}


const reduceActions = actions=> {
	const actionNames = Object.keys(actions)
	if (!actions || !actionNames.length) return null
	return actions
}


// typeReducer
const typeReducer = module=> {
	const {
		name, title, comment,
		documentationURL,
		fields, modules,
		mutations, getters,
	} = module
	
	// pre-process module
	const type = {
		title: name+(title?`; ${title}`:''),
		description: comment,
		
		titleInList: mdLink(name, documentationURL),
		subtitleInList:
			(title?` - ${title}`:'')
			+ (comment?`, ${comment}`:''),


		fieldsTable: fields && [
			['Field', 'Type', 'Comment'],
			...Object.keys(fields).map(fieldName=> {
				const field = fields[fieldName]
				return [
					mdLink(fieldName, field.documentationURL),
					mdTypeLink(field),
					limitStrLength(field.comment || '', 80),
				]
			}),
		],

		modules: modules && Object.keys(modules)
			.map(k=> modules[k]).map(m=> m.type[namespace]).filter(f=> f),
	}

	type.actions = {
		mutations: reduceActions(mutations),
		getters: reduceActions(getters),
	}
	if (!type.actions.mutations && !type.actions.getters)
		type.actions = null

	// expose processed-type to markdown-string function
	type.toString = !module.__isParsed
		? ()=> '...module not yet parsed...'
		: getModuleMDTypeToMDString(type)
	
	return type
}



const writeFile = defaults=> (module, options={})=> {
	const opt = Object.assign({
		outputFile: 'api-specification.md',
		includedPluginDescriptions: [],
	}, defaults, options)
	const {outputFile, includedPluginDescriptions} = opt

	const section = includedPluginDescriptions.map(plugin=> plugin.documentation)
		.filter(d=> d).map(d=>
			`### ${d.title}\n`
			+ `${d.description}`
		)
		.join('\n\n\n')

	const txt = module.type[namespace].toString({
		isBase: true,
		sectionAfterDescription: section,
	})

	const fs = require('fs')
	return new Promise((res, rej)=> {
		fs.writeFile(outputFile, txt, err=> err?rej(err):res())
	})
}


export default function MarkdownPlugin (defaults) {
	return {
		namespace,

		initialiseModule,
		// dataTypes,
		typeReducer,

		actions: {
			mutationWrapper: (context, fn)=> fn(context),
			fetcherWrapper: (context, fn)=> fn(context),
		},

		helpers: {
			writeFile: writeFile(defaults),
		},
		moduleHelpers: {
			writeFile: module=> options=> writeFile(defaults)(module, options),
		},
	}
}
