import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Membership as MembershipType,
  MembershipFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Membership = {
  type: MembershipType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("memberships")
      .where({ id })
      .first()
      .then(async (membership) => {
        membership.abilities = await Database("abilities")
          .select([
            "id",
            "name",
            "description",
            "description1",
            "description2",
            "regular_price",
            "discount_price",
          ])
          .where({
            membership_id: membership.id,
          });

        return membership;
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allMemberships = {
  type: new GraphQLList(MembershipType),
  args: { ...paginationArgs, filter: { type: MembershipFilter } },
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
    Database("memberships")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((memberships) => {
        return memberships.map(async (membership) => {
          membership.abilities = await Database("abilities")
            .select([
              "id",
              "name",
              "description",
              "description1",
              "description2",
              "regular_price",
              "discount_price",
            ])
            .where({
              membership_id: membership.id,
            });

          return membership;
        });
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allMembershipsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MembershipFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("memberships")
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

export default { Membership, allMemberships, _allMembershipsMeta };
