import { Database } from "@local/lib/index.js";
import { Session } from "@local/graphql/types/index.js";
import { deleteSessionValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
	type: Session,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (_, params) =>
		deleteSessionValidation.validate({ ...params }).then(() =>
			Database("sessions")
				.where({
					...params,
				})
				.del()
				.returning("*")
				.then(([session]) => session)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};
