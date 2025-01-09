import yup from "yup";
import {
	validatePresence,
	validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
	name: yup
		.string()
		.required()
		.test("valid", "invalid_syntax", validateTextInput),

	file_id: yup
		.string()
		.required()
		.test("present", "file_not_found", validatePresence("files", "id")),
});
