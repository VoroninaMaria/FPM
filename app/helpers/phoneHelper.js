const phoneRegex = /^380[0-9]{9}$/;
const validatePhone = (phone) => phone && phone.match(phoneRegex);

export default validatePhone;
