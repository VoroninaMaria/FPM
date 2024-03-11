import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { BLOCK_TYPES } from "@local/app/constants/index.js";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

const createBlockBaseValidation = yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.blocksEditor) {
            return true;
          }
          return false;
        });
    }),
  type: yup
    .string()
    .required()
    .test("status", "unknown_block_type", (value) =>
      Object.keys(BLOCK_TYPES).includes(value)
    ),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("blocks", ["name", "page_id"])
    ),
  page_id: yup
    .string()
    .required()
    .test("present", "page_not_found", async function (id) {
      return Database("designs")
        .where({
          id: await Database("pages")
            .select("design_id")
            .where({ id })
            .first()
            .then(({ design_id }) => design_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
          merchant_id: this.parent.merchant_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  position: yup
    .number()
    .required()
    .positive("Position should be greater than 0!")
    .integer("Position should be integer!"),
  blocks: yup.number().required().positive("Blocks should be greater than 0!"),
});

export default createBlockBaseValidation;
