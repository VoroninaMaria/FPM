import yup from "yup";
import {
  validatePresence,
  validateColor,
  validateCssPosition,
} from "@local/graphql/validations/shared/index.js";

const Image = yup.object({
  props: yup.object({
    redirect_page_id: yup.string().notRequired(),
    file_id: yup
      .string()
      .required()
      .test("present", "file_not_found", validatePresence("files", "id")),
  }),
  container_styles: yup.object({
    backgroundColor: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),
    justifyContent: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) =>
          rule.test(
            "value",
            "unknown_justifyContent_value",
            validateCssPosition
          ),
      }),
    alignItems: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) =>
          rule.test("value", "unknown_alignItems_value", validateCssPosition),
      }),
  }),

  styles: yup.object({
    borderWidth: yup.number().min(0).notRequired(),
    width: yup.number().min(0).max(100).notRequired(),
    height: yup.number().min(0).max(100).notRequired(),
    borderRadius: yup.number().min(0).notRequired(),
    borderColor: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),

    resizeMode: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) =>
          rule.test("value", "unknown_resizeMode_value", (value) =>
            ["cover", "contain", "stretch", "repeat", "center"].includes(value)
          ),
      }),
  }),
});

export default Image;
