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
	category_id: yup
		.string()
		.required()
		.test(
			"present",
			"category_not_found",
			validatePresence("categories", "id")
		),
	file_id: yup
		.string()
		.required()
		.test("present", "file_not_found", validatePresence("files", "id")),
});
