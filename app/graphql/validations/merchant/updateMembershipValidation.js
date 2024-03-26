import yup from "yup";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

let id_validation_ability_name;

export default yup.object({
  id: yup.string().test("getId", "wrong_getId", async function (id) {
    id_validation_ability_name = id;
    return true;
  }),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput),
  price: yup.number().required(),
  start_date: yup.date(),
  end_date: yup.date(),
  location_id: yup
    .string()
    .required()
    .test("present", "location_not_found", validatePresence("locations", "id")),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  abilities: yup
    .array()
    .test(
      "unique",
      "dublicate_name_of_abilities_update",
      async function (abilities) {
        let res = false;

        if (abilities?.length > 0) {
          const names = abilities.map(({ name }) => name);

          const namesUniq = names.filter(function (arg1, arg2, self) {
            return arg2 === self.indexOf(arg1);
          });

          if (names.length === namesUniq.length) {
            res = true;
          }
        } else {
          res = true;
        }

        return res;
      }
    )
    .of(
      yup.object({
        name: yup
          .string()
          .required()
          .test("valid", "invalid_syntax", validateTextInput)
          .test(
            "unique",
            "name_of_ability_already_exist",
            async function (name) {
              if (this.parent.id) {
                return Database("abilities")
                  .whereNot({ id: this.parent.id })
                  .where({
                    name,
                    membership_id: id_validation_ability_name,
                  })
                  .first()
                  .then((membership) => !membership)
                  .catch(() => {
                    throw new GraphQLError("Forbidden");
                  });
              } else {
                return Database("abilities")
                  .where({
                    name,
                    membership_id: id_validation_ability_name,
                  })
                  .first()
                  .then((membership) => !membership)
                  .catch(() => {
                    throw new GraphQLError("Forbidden");
                  });
              }
            }
          ),
        regular_price: yup.number().integer("invalid_syntax").required(),
        discount_price: yup.number().integer("invalid_syntax").required(),
      })
    ),
});
