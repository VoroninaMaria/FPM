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
	location_id: yup
		.string()
		.required()
		.test("present", "location_not_found", validatePresence("locations", "id")),
});
