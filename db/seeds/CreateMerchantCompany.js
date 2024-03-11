export const seed = async (knex) => {
  const bolt = await knex("merchants").where({ name: "bolt" }).first();
  const uber = await knex("merchants").where({ name: "uber" }).first();

  return knex("companies").insert([
    {
      name: "Mango",
      merchant_id: bolt.id,
    },
    {
      name: "Banana",
      merchant_id: uber.id,
    },
  ]);
};
