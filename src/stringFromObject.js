// stringFromObject; similar to console.dir, although more rim/yaml-like
const stringFromObject = (obj, depth=1, options={}, prefix='')=> {
	const opt = Object.assign({
		keepCollapsed: [],
		maxObjectStringLength: 100,
		indentation: '  ',
	}, options)
	const {indentation, maxObjectStringLength} = opt

	// only same object expand once
	const isObject = typeof obj==='object'
	const keepCollapsed = isObject && opt.keepCollapsed.indexOf(obj)>=0
	if (isObject && !keepCollapsed) opt.keepCollapsed.push(obj)

	// render object name
	const getObjectName = obj=> {
		if (obj.toString === [].toString) return 'Array'
		const objOrFunc = typeof obj == 'object' || typeof obj == 'function'
		const objStr = (objOrFunc && typeof obj.name == 'string' && obj.name)
			|| (obj.toString && obj.toString())
			|| typeof obj
		return objStr
		// const useObjStr = objStr!=='[object Object]'
		// return useObjStr? objStr.replace(/\n(.| |\n)*$/, '...'): null
	}

	// when value shouldn't be futher expanded
	if (depth==0 || !isObject || keepCollapsed || !obj) {

		// primitive
		if (typeof obj === 'number' || typeof obj === 'boolean')
			return `\x1b[33m${obj}\x1b[0m`

		// string
		if (typeof obj === 'string')
			return `\x1b[32m${obj.replace(/\n/g, '\n'+prefix)}\x1b[0m`

		// function
		if (typeof obj === 'function')
			return `\x1b[36m${(obj+'').split('\n')[0].replace(/function (.*) {/ig, '$1=> ...')}\x1b[0m`

		// undefined or null
		if (typeof obj === 'undefined')
			return '\x1b[37mundefined\x1b[0m'
		if (obj === null)
			return '\x1b[37mnull\x1b[0m'

		// othervise; object
		try {
			const name = getObjectName(obj)
			const str = (keepCollapsed || name?'-> ':'')
				+ (name || JSON.stringify(obj))
			if (str.length>maxObjectStringLength)
				return str.substr(0, maxObjectStringLength-3)+'...'
			return str
		} catch (err) {
			return (keepCollapsed?'-> ':'')+obj
		}
	}

	// if value might be futher expanded
	const keys = Object.keys(obj)
	if (!keys.length) return '{}'
	const name = getObjectName(obj)

	return (name || '')+keys.map(k=> `\n${prefix}\x1b[${33+(depth%4)}m${k}: \x1b[0m${
		stringFromObject(obj[k], depth-1, opt, prefix+indentation)
	}`).join('')
}

export default stringFromObject
export const log = (obj, depth=5, opt)=> console.log(stringFromObject(obj, depth, opt))
