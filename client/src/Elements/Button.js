import { Text, Pressable } from "react-native";
import buildStyles from "./Button.styles";
const Button = ({
  styles,
  text,
  actions,
  action,
  storage,
  redirect_page_id,
}) => {
  const builtStyles = buildStyles(styles);
  const processOnPress = () => {
    if (action) return actions[action](storage);
    if (redirect_page_id)
      return storage.callbacks.redirect({ page: redirect_page_id });
  };

  return (
    <Pressable style={builtStyles.Input} onPress={processOnPress}>
      <Text style={builtStyles.Text}>{text}</Text>
    </Pressable>
  );
};

export default Button;
