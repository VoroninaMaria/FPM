import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
	Hall as HallType,
	HallFilter,
	ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Hall = {
	type: HallType,
	args: { id: { type: new GraphQLNonNull(GraphQLID) } },
	resolve: (_, { id }) =>
		Database("halls")
			.where({ id })
			.first()
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

const allHalls = {
	type: new GraphQLList(HallType),
	args: { ...paginationArgs, filter: { type: HallFilter } },
	resolve: (
		_,
		{
			perPage = 20,
			page = 0,
			sortField = "merchant_id",
			sortOrder = "asc",
			filter: { ids, ...filter },
		}
	) =>
		Database("halls")
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

const _allHallsMeta = {
	type: ListMetadata,
	args: { ...paginationArgs, filter: { type: HallFilter } },
	resolve: (_, { filter: { ids, ...filter } }) =>
		Database("halls")
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

export default { Hall, allHalls, _allHallsMeta };
