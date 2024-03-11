import { Text as NativeText } from "react-native";
import buildStyles from "./Text.styles";

const Text = ({ styles, text }) => {
  const builtStyles = buildStyles(styles);

  return <NativeText style={builtStyles.Text}>{text}</NativeText>;
};

export default Text;
