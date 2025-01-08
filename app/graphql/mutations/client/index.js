// @local/app/graphql/queries/client/index.js
import { GraphQLList, GraphQLError, GraphQLID } from "graphql";
import { Database } from "@local/lib/index.js";
import { GraphQLNonNull, GraphQLString } from "graphql";
import { Session as SessionType } from "@local/graphql/types/index.js";

const updateSessionPlace = {
	type: SessionType,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		place_arr: { type: new GraphQLList(GraphQLString) },
	},
	resolve: (_, params) =>
		Database("sessions")
			.where({
				id: params.id,
			})
			.update({
				place_arr: params.place_arr,
				updated_at: Database.fn.now(),
			})
			.returning("*")
			.then(([session]) => session)
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

export default {
	updateSessionPlace,
};
