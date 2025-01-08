import {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
} from "graphql";

export default new GraphQLObjectType({
	name: "Session",
	fields: {
		id: { type: GraphQLID },
		location_id: { type: GraphQLID },
		hall_id: { type: GraphQLID },
		movie_id: { type: GraphQLID },
		time: { type: GraphQLString },
		day: { type: GraphQLString },
		place_arr: { type: new GraphQLList(GraphQLString) },
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString },
	},
});
