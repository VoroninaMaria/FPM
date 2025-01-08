import { Database } from "@local/lib/index.js";
import { Session } from "@local/graphql/types/index.js";
import { updateSessionValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
	GraphQLList,
} from "graphql";

export default {
	type: Session,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		time: { type: new GraphQLNonNull(GraphQLString) },
		day: { type: new GraphQLNonNull(GraphQLString) },
		hall_id: { type: new GraphQLNonNull(GraphQLID) },
		movie_id: { type: new GraphQLNonNull(GraphQLID) },
		location_id: { type: new GraphQLNonNull(GraphQLID) },
		place_arr: { type: new GraphQLList(GraphQLString) },
	},
	resolve: (_, params) =>
		updateSessionValidation.validate({ ...params }).then(() =>
			Database("sessions")
				.where({
					id: params.id,
				})
				.update({
					time: params.time,
					day: params.day,
					hall_id: params.hall_id,
					movie_id: params.movie_id,
					location_id: params.location_id,
					place_arr: params.place_arr,
					updated_at: Database.fn.now(),
				})
				.returning("*")
				.then(([session]) => session)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};
