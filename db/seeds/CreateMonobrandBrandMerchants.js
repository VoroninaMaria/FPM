const merchantsWithMonoBrandDefault = ["uklon"];
const merchantsWithMonoBrandCustom = ["uber"];
const brandName = "Monobrand";

export const seed = async (knex) => {
  await knex("merchants")
    .select("id")
    .whereIn("name", merchantsWithMonoBrandDefault)
    .then((merchant_ids) =>
      knex("brands")
        .select("id")
        .where({ name: brandName })
        .first()
        .then(({ id: brand_id }) =>
          knex("brand_merchants")
            .insert(
              merchant_ids.map(({ id: merchant_id }) => ({
                merchant_id,
                brand_id,
              }))
            )
            .onConflict(["merchant_id", "brand_id"])
            .merge()
        )
    );

  return knex("merchants")
    .select("id")
    .whereIn("name", merchantsWithMonoBrandCustom)
    .then((merchant_ids) =>
      knex("brands")
        .select("id")
        .where({ name: brandName })
        .first()
        .then(({ id: brand_id }) =>
          knex("brand_merchants")
            .insert(
              merchant_ids.map(({ id: merchant_id }) => ({
                merchant_id,
                brand_id,
                config: {
                  Apikey:
                    "f197f166f4d410e531bdd392813ed6bbf817f0c5007c3eee7893935dd2b5bb74",
                  partnerId: "cargofy-q2fy",
                },
              }))
            )
            .onConflict(["merchant_id", "brand_id"])
            .merge()
        )
    );
};
