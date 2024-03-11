import { useRecordContext, useLocaleState } from "react-admin";
import PropTypes from "prop-types";
import moment from "moment";
import "moment/locale/uk.js";

const setLocale = (locale) => {
  moment.locale(locale);
};

const DateField = ({ source }) => {
  const record = useRecordContext();
  const [locale] = useLocaleState();

  setLocale(locale);
  const value = record[source];
  const numValue = parseInt(value);
  const dateValue = Date.parse(value);

  if (isNaN(dateValue))
    return <span>{record && moment(numValue).calendar()}</span>;

  return <span>{record && moment(dateValue).calendar()}</span>;
};

DateField.propTypes = {
  source: PropTypes.string.isRequired,
};

export default DateField;
