import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
	name: "Movie",
	fields: {
		id: { type: GraphQLID },
		category_id: { type: GraphQLID },
		file_id: { type: GraphQLID },
		name: { type: GraphQLString },
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString },
	},
});
