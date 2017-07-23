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

const limitStrLength = (str, n=100)=>
	str.length>n ? str.substr(0, n-3)+'...' : str


// typeReducer
const typeReducer = module=> {
	const {fields, modules, name, title, comment, isEntity} = module
	const titleMD = title? `${title} (${name})` : name
	const section = [`### ${titleMD}`]
	if (comment) section.push(comment)

	if (fields && isEntity) {
		const rows = [['Name', 'Type', 'Comment']]
		Object.keys(fields).forEach(fieldName=> {
			const field = fields[fieldName]
			const typeMD = (field.documentationURL
				? `[${field.type.name}](${field.documentationURL})`
				: field.type.name) + (field.allowNull? '?': '')

			rows.push([fieldName, typeMD, limitStrLength(field.comment || '', 80)])
		})
		section.push(tableFromRows(rows))
	}
	if (modules && !isEntity) {
		section.push('#### Modules')
		const rows = [['Name', 'Comment']]
		Object.keys(modules).forEach(name=> {
			const module = modules[name]
			const mName = module.name||'-'
			const nameMD = `[${mName}](${module.documentationURL})`
			rows.push([nameMD, limitStrLength(module.comment || '', 80)])
		})
		section.push(tableFromRows(rows))
		section.push('')
		const subModulesMD = Object.keys(modules).map(k=> modules[k]).map(m=> m.type[namespace])
		section.push(subModulesMD.join('\n\n'))
	}


	return section.join('\n')
}



const writeFile = defaults=> (module, options={})=> {
	const opt = Object.assign({
		outputFile: 'api-specification.md',
	}, defaults, options)
	const {outputFile} = opt

	const fs = require('fs')
	return new Promise((res, rej)=> {
		fs.writeFile(outputFile, module.type[namespace], err=> err?rej(err):res())
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
