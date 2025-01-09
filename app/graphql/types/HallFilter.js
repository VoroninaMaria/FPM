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
		min_price: { type: GraphQLFloat },
		location_id: { type: GraphQLString },
		name: { type: GraphQLString },
		places: { type: GraphQLFloat },
	}),
});
