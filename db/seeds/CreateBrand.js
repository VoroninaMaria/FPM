export const seed = (knex) =>
  knex("brands")
    .where({ name: "Monobrand" })
    .first()
    .then(
      (brand) =>
        !brand &&
        knex("brands").insert({
          name: "Monobrand",
          default_config: {
            Apikey:
              "f197f166f4d410e531bdd392813ed6bbf817f0c5007c3eee7893935dd2b5bb74",
            partnerId: "cargofy-q2fy",
          },
        })
    );
