export default class ValidationError extends Error {
	message = ''

	constructor (props) {
		super(props)
		
		if (typeof props === 'string')
			this.message = props
	}

	// toString...
}
