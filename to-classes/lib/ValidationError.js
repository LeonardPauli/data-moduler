// @flow

export default class ValidationError extends Error {
	message = ''

	constructor (props: string) {
		super(props)
		
		if (typeof props === 'string')
			this.message = props
	}

	// toString...
}
