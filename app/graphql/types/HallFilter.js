import {
	GraphQLInputObjectType,
	GraphQLID,
	GraphQLList,
	GraphQLString,
	GraphQLFloat,
} from "graphql";

export default new GraphQLInputObjectType({
	name: "HallFilter",
	fields: () => ({
		id: { type: GraphQLID },
		ids: { type: new GraphQLList(GraphQLID) },
		location_id: { type: GraphQLString },
		name: { type: GraphQLString },
		places: { type: GraphQLFloat },
	}),
});
