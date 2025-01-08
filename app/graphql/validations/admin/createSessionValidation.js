import yup from "yup";
import {
	validatePresence,
	validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
	time: yup
		.string()
		.required()
		.test("valid", "invalid_syntax", validateTextInput),
	day: yup
		.string()
		.required()
		.test("valid", "invalid_syntax", validateTextInput),
	hall_id: yup
		.string()
		.required()
		.test("present", "hall_not_found", validatePresence("halls", "id")),
	location_id: yup
		.string()
		.required()
		.test("present", "location_not_found", validatePresence("locations", "id")),
	movie_id: yup
		.string()
		.test("present", "movie_id", validatePresence("movies", "id")),
});
