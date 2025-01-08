import { Database } from "@local/lib/index.js";
import { Session } from "@local/graphql/types/index.js";
import { createSessionValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
} from "graphql";

export default {
	type: Session,
	args: {
		time: { type: new GraphQLNonNull(GraphQLString) },
		day: { type: new GraphQLNonNull(GraphQLString) },
		hall_id: { type: new GraphQLNonNull(GraphQLID) },
		movie_id: { type: new GraphQLNonNull(GraphQLID) },
		location_id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: async (_, params) => {
		await createSessionValidation.validate({ ...params });

		try {
			const hall = await Database("halls")
				.select("places")
				.where({ id: params.hall_id })
				.first();

			if (!hall) {
				throw new GraphQLError("Hall not found");
			}

			const place_arr = Array.from({ length: hall.places }, () => false);

			const [session] = await Database("sessions")
				.insert({
					...params,
					place_arr,
				})
				.returning("*");

			return session;
		} catch (error) {
			console.error(error);
			throw new GraphQLError("Failed to create session");
		}
	},
};
