import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { BLOCK_TYPES } from "@local/app/constants/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

const updateBlockBaseValidation = yup.object({
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
    .test("unique", "already_exist", async function (name) {
      return Database("blocks")
        .whereNot({ id: this.parent.id })
        .where({
          name,
          page_id: await Database("blocks")
            .select("page_id")
            .where({ id: this.parent.id })
            .first()
            .then(({ page_id }) => page_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
        })
        .first()
        .then((block) => !block)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  id: yup
    .string()
    .required()
    .test("present", "block_not_found", validatePresence("blocks", "id")),
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

export default updateBlockBaseValidation;
