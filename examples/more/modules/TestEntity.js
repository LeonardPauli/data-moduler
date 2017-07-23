import dataModuler from '../dataModuler'
const { allowNull, STRING, DECIMAL } = dataModuler

export default {
	// name: 'TestEntity',
	// tabelName: 'test_entity',
	fields: {
		name: { STRING, allowNull },
		age: {DECIMAL, allowNull},
	},
}
// things: { type: new GraphQLList(Thing), resolve: p=> p.getThing() },
