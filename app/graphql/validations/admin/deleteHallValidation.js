import yup from "yup";
import { validatePresence } from "@local/graphql/validations/shared/index.js";

export default yup.object({
	id: yup
		.string()
		.required()
		.test("present", "halls", validatePresence("halls", "id")),
});
