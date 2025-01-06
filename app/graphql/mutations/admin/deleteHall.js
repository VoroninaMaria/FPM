import { Database } from "@local/lib/index.js";
import { Hall } from "@local/graphql/types/index.js";
import { deleteHallValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
	type: Hall,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (_, params) =>
		deleteHallValidation.validate({ ...params }).then(() =>
			Database("halls")
				.where({
					...params,
				})
				.del()
				.returning("*")
				.then(([hall]) => hall)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};
