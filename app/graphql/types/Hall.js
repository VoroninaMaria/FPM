import {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLFloat,
} from "graphql";

export default new GraphQLObjectType({
	name: "Hall",
	fields: {
		id: { type: GraphQLID },
		location_id: { type: GraphQLID },
		name: { type: GraphQLString },
		places: { type: GraphQLFloat },
		min_price: { type: GraphQLFloat },
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString },
	},
});
