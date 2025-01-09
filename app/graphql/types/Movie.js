import {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
} from "graphql";

export default new GraphQLObjectType({
	name: "Movie",
	fields: {
		id: { type: GraphQLID },
		file_id: { type: GraphQLID },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		start_date: { type: GraphQLString },
		age: { type: GraphQLString },
		duration: { type: GraphQLString },
		main_roles: { type: GraphQLString },
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString },
		categories_ids: { type: new GraphQLList(GraphQLID) },
	},
});
