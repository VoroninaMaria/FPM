import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
	Session as SessionType,
	SessionFilter,
	ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Session = {
	type: SessionType,
	args: { id: { type: new GraphQLNonNull(GraphQLID) } },
	resolve: (_, { id }) =>
		Database("sessions")
			.where({ id })
			.first()
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

const allSessions = {
	type: new GraphQLList(SessionType),
	args: { ...paginationArgs, filter: { type: SessionFilter } },
	resolve: (
		_,
		{
			perPage = 20,
			page = 0,
			sortField = "location_id",
			sortOrder = "asc",
			filter: { ids, ...filter },
		}
	) =>
		Database("sessions")
			.where({ ...filter })
			.modify((queryBuilder) => {
				if (ids?.length) queryBuilder.whereIn("id", ids);
			})
			.limit(perPage)
			.offset(page * perPage)
			.orderBy(sortField, sortOrder)
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

const _allSessionsMeta = {
	type: ListMetadata,
	args: { ...paginationArgs, filter: { type: SessionFilter } },
	resolve: (_, { filter: { ids, ...filter } }) =>
		Database("sessions")
			.where({ ...filter })
			.modify((queryBuilder) => {
				if (ids?.length) queryBuilder.whereIn("id", ids);
			})
			.count()
			.first()
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

export default { Session, allSessions, _allSessionsMeta };
