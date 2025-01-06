export const seed = (knex) =>
  knex("merchants").then((merchants) =>
    knex("categories")
      .insert(
        merchants
          .map(({ id: merchant_id }) => [
            {
              name: "businki",
              merchant_id,
            },
            {
              name: "bubochki",
              merchant_id,
            },
            {
              name: "pidori",
              merchant_id,
            },
          ])
          .flat()
      )
      .onConflict(["merchant_id", "name"])
      .merge()
  );
