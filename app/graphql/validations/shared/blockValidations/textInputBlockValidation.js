import yup from "yup";
import {
  validateColor,
  validateCssPosition,
  validateTextAlign,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

const TextInput = yup.object({
  props: yup.object({
    text: yup
      .string()
      .required()
      .test("valid", "invalid_syntax", validateTextInput),
  }),
  styles: yup.object({
    fontWeight: yup.number().positive().notRequired(),
    fontSize: yup.number().positive().notRequired(),
    fontStyle: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) =>
          rule.test("value", "invalid_font_style", (fontStyle) =>
            ["normal", "italic"].includes(fontStyle)
          ),
      }),
    color: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),
    textAlign: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) =>
          rule.test("value", "unknown_textAlign_value", validateTextAlign),
      }),
    backgroundColor: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),
    placeholderTextColor: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),
    borderColor: yup
      .string()
      .notRequired()
      .when({
        is: (exists) => !!exists,
        then: (rule) => rule.test("value", "invalid_syntax", validateColor),
      }),
    height: yup.number().min(0).max(100).notRequired(),
    width: yup.number().min(0).max(100).notRequired(),
    borderRadius: yup.number().min(0).notRequired(),
    borderWidth: yup.number().min(0).notRequired(),
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
});

export default TextInput;
