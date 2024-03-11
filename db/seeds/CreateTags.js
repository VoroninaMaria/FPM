export const seed = (knex) =>
  knex("merchants").then((merchants) =>
    knex("tags")
      .insert(
        merchants
          .map(({ id: merchant_id }) => [
            {
              name: "cool guy",
              merchant_id,
            },
            {
              name: "ignore him",
              merchant_id,
            },
            {
              name: "elite",
              merchant_id,
            },
          ])
          .flat()
      )
      .onConflict(["merchant_id", "name"])
      .merge()
  );
