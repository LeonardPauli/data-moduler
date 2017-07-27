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


// helper
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


// limitStrLength
const limitStrLength = (str, n=100)=>
	str.length>n ? str.substr(0, n-3)+'...' : str


// getModuleMDTypeToMDString
const getModuleMDTypeToMDString = type=> isBase=> {
	const {
		title, description,
		fieldsTable, // titleInList, subtitleInList,
		modules,
	} = type
	
	const doc = []
	const addBreak = n=> Array(n).fill('').forEach(v=> doc.push(v))

	if (!isBase) {
		doc.push('### '+title) // title
		if (description) doc.push(description) // description
		if (fieldsTable) doc.push(tableFromRows(fieldsTable)) // fieldsTable
		return doc.join('\n')
	}

	doc.push('# '+title) // title
	if (description) doc.push(description) // description

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
			doc.push(module.toString())
		})
	}

	return doc.join('\n')
}



// typeReducer
const typeReducer = module=> {
	const {
		name, title, comment,
		documentationURL,
		fields, modules,
	} = module
	
	const mdLink = (text, link)=> link
		?	`[${text}](${link})`
		: text

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
					mdLink(field.type.name, field.type.documentationURL)+(field.allowNull? '?': ''),
					limitStrLength(field.comment || '', 80),
				]
			}),
		],

		modules: modules && Object.keys(modules).map(k=> modules[k]).map(m=> m.type[namespace]),
	}

	// expose processed-type to markdown-string function
	type.toString = getModuleMDTypeToMDString(type)
	
	return type
}



const writeFile = defaults=> (module, options={})=> {
	const opt = Object.assign({
		outputFile: 'api-specification.md',
	}, defaults, options)
	const {outputFile} = opt

	const fs = require('fs')
	return new Promise((res, rej)=> {
		fs.writeFile(outputFile, module.type[namespace].toString(true), err=> err?rej(err):res())
	})
}


export default function Markdown (defaults) {
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
