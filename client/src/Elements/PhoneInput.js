import { TextInput } from "react-native";
import buildStyles from "./PhoneInput.styles";

const PhoneInput = ({ styles, storage }) => {
  const builtStyles = buildStyles(styles);

  return (
    <TextInput
      style={builtStyles.inputText}
      placeholder="380000000000"
      value={storage.auth.phone}
      maxLength={12}
      onChangeText={(number) => {
        storage.callbacks.setUserPhone(number);
      }}
      inputMode="numeric"
    />
  );
};

export default PhoneInput;
