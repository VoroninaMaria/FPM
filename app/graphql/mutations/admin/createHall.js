import { Database } from "@local/lib/index.js";
import { Hall } from "@local/graphql/types/index.js";
import { createHallValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLID,
	GraphQLError,
} from "graphql";

export default {
	type: Hall,
	args: {
		name: { type: new GraphQLNonNull(GraphQLString) },
		places: { type: new GraphQLNonNull(GraphQLFloat) },
		location_id: { type: new GraphQLNonNull(GraphQLID) },
		min_price: { type: new GraphQLNonNull(GraphQLFloat) },
	},
	resolve: (_, params) =>
		createHallValidation.validate({ ...params }).then(() =>
			Database("halls")
				.insert({
					...params,
				})
				.returning("*")
				.then(([hall]) => hall)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};
