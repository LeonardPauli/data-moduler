// data-moduler
// Created by Leonard Pauli, July 2017 (to-classes started 1 oct)
// Copyright Leonard Pauli, All rights reserved
// @flow

// only inported to run setup scripts
require('./defaults')

import {
	DataModule,
	dataTypes, flags,
	plugins, destinations,
	modulate,
	ValidationError,
	validateAgainstFields,
	performModuleModification,
	performModuleModifications,
	context,
} from './lib'
export {
	DataModule,
	dataTypes, flags,
	plugins, destinations,
	modulate,
	ValidationError,
	validateAgainstFields,
	performModuleModification,
	performModuleModifications,
	context,
}
