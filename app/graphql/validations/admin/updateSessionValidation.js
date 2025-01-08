import yup from "yup";
import {
	validatePresence,
	validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
	day: yup
		.string()
		.required()
		.test("valid", "invalid_syntax", validateTextInput),
	time: yup
		.string()
		.required()
		.test("valid", "invalid_syntax", validateTextInput),
	hall_id: yup
		.string()
		.required()
		.test("present", "location_not_found", validatePresence("halls", "id")),
	location_id: yup
		.string()
		.required()
		.test("present", "location_not_found", validatePresence("locations", "id")),
	movie_id: yup
		.string()
		.required()
		.test("present", "location_not_found", validatePresence("movies", "id")),
});
