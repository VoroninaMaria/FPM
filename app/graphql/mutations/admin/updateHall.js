import { Database } from "@local/lib/index.js";
import { Hall } from "@local/graphql/types/index.js";
import { updateHallValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
	GraphQLFloat,
} from "graphql";

export default {
	type: Hall,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		location_id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		places: { type: new GraphQLNonNull(GraphQLFloat) },
	},
	resolve: (_, params) =>
		updateHallValidation.validate({ ...params }).then(() =>
			Database("halls")
				.where({
					id: params.id,
				})
				.update({
					name: params.name,
					places: params.places,
					location_id: params.location_id,
					updated_at: Database.fn.now(),
				})
				.returning("*")
				.then(([hall]) => hall)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};
