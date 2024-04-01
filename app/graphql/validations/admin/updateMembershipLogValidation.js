import yup from "yup";

export default yup.object({
  start_date: yup.date().required(),
  end_date: yup.date().required(),
});
