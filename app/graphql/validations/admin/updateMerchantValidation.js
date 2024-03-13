import yup from "yup";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
  status: yup
    .string()
    .required()
    .test("status", `unknown_status`, (value) =>
      Object.keys(MERCHANT_STATUSES).includes(value)
    ),
  storage_capacity: yup.number().required().integer().min(0),
  id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
});
