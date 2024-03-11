const textInputRegex = /^(?!\s).*/;

const validateTextInput = (value) => textInputRegex.test(value);

export default validateTextInput;
