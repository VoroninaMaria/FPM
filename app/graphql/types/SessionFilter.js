import {
	GraphQLInputObjectType,
	GraphQLID,
	GraphQLList,
	GraphQLString,
} from "graphql";

export default new GraphQLInputObjectType({
	name: "SessionFilter",
	fields: () => ({
		id: { type: GraphQLID },
		ids: { type: new GraphQLList(GraphQLID) },
		location_id: { type: GraphQLID },
		hall_id: { type: GraphQLID },
		movie_id: { type: GraphQLID },
		time: { type: GraphQLString },
		day: { type: GraphQLString },
	}),
});
