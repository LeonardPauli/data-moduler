// helpers
const stringFromObject = (obj, depth=1, prefix='', indentation='  ')=> {
	if (depth==0 || typeof obj !== 'object') return obj
	return Object.keys(obj).map(k=> `\n${prefix}${k}: ${
		stringFromObject(obj[k], depth-1, prefix+indentation)
	}`).join('')
}


// metaNormaliser
const metaNormaliser = module=> {
	const {name: rawName, tabelName, comment, documentationURL} = module
	const props = {}

	// name
	const name = !module.isEntity && !rawName ? 'BaseModule' : rawName
	if (!name || !name.length)
		throw new Error('moduleParser: module.name is required\n\n'
			+ stringFromObject(module, 2, {}, '\t')
			+ '\n\n')
	props.name = name

	if (module.isEntity)
		props.tabelName = tabelName || name
			.replace(/^[A-Z]/, l=> l.toLowerCase())
			.replace(/[A-Z]/g, l=> '_'+l.toLowerCase())

	if (typeof comment !== 'undefined')
		props.comment = comment // no autogen

	props.documentationURL = documentationURL
		|| (name && `#${name.toLowerCase()}`)
	
	return props
}

const getMetaNormaliser = ()=> metaNormaliser
export default getMetaNormaliser
