const colorRegex = /^#[0-9a-f]{3,6}$/i;

const validateColor = (value) => colorRegex.test(value);

export default validateColor;
