const validateFieldName = (value) =>
  ["first_name", "last_name", "phone", "email"].includes(value);

export default validateFieldName;
