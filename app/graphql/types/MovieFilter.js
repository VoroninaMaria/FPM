import {
	GraphQLInputObjectType,
	GraphQLID,
	GraphQLList,
	GraphQLString,
} from "graphql";

export default new GraphQLInputObjectType({
	name: "MovieFilter",
	fields: () => ({
		id: { type: GraphQLID },
		ids: { type: new GraphQLList(GraphQLID) },
		category_id: { type: GraphQLID },
		file_id: { type: GraphQLID },
		description: { type: GraphQLString },
		start_date: { type: GraphQLString },
		age: { type: GraphQLString },
		duration: { type: GraphQLString },
		main_roles: { type: GraphQLString },
		name: { type: GraphQLString },
	}),
});
