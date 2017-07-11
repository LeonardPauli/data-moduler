import dataModuler from '../dataModuler'
const { allowNull, STRING } = dataModuler

export default {
	// name: 'TestEntity',
	// tabelName: 'test_entity',
	fields: {
		name: { STRING, allowNull },
	},
}
// things: { type: new GraphQLList(Thing), resolve: p=> p.getThing() },
