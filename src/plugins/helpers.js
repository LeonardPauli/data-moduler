export const itemFieldsIterator = (context, fn)=> item=> {
	if (!item) return item
	const {thisAction} = context
	const newFields = {...item}
	const returnType = thisAction.type.type.ofType || thisAction.type.type
	const returnModule = returnType._module
	if (!returnModule) return newFields

	const moduleFields = returnModule.fields
	Object.keys(moduleFields).forEach(name=> {
		const moduleField = moduleFields[name]
		const fieldModule = moduleField.type._module
		
		newFields[name] = fn({
			data: newFields[name],
			field: moduleField,
			module: fieldModule,
			context,
		})
	})

	return newFields
}
