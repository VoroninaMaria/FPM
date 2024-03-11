import { TextInput } from "react-native";
import buildStyles from "./PasswordInput.styles";

const PasswordInput = ({ styles, storage }) => {
  const builtStyles = buildStyles(styles);

  return (
    <TextInput
      style={builtStyles.inputText}
      placeholder="Password"
      value={storage.auth.password}
      placeholderTextColor="black"
      maxLength={12}
      onChangeText={(pass) => {
        storage.callbacks.setPassword(pass);
      }}
      keyboardType="numeric"
    />
  );
};

export default PasswordInput;
