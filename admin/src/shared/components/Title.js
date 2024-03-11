import { useRecordContext } from "react-admin";
import PropTypes from "prop-types";

const Title = ({ source }) => {
  const record = useRecordContext();

  if (!record) return null;

  return <span>{record[source]}</span>;
};

Title.propTypes = {
  source: PropTypes.string.isRequired,
};

export default Title;
