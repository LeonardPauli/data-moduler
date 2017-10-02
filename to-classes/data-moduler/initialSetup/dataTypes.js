import {dataTypes, DataModule} from '../index'
const {DataType, registerDataType} = dataTypes

@registerDataType
class STRING extends DataType {
	static matchesRawType (key, value) {
		if (value===String) return true
		return super.matchesRawType(key, value)
	}
}

@registerDataType
class MODULE extends DataType {
	static matchesRawType (key, value) {
		// value._isModule
		if (value instanceof DataModule) return true
		return super.matchesRawType(key, value)
	}
}
