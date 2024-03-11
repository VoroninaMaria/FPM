import { TextInput } from "react-native";
import buildStyles from "./TextInput.styles";

const TextsInput = ({ styles, text }) => {
  const builtStyles = buildStyles(styles);

  return (
    <TextInput
      style={builtStyles.inputText}
      placeholder={text}
      maxLength={255}
    />
  );
};

export default TextsInput;
