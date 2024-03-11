import ImageBlockInputs from "./ImageBlockInputs.js";
import TextBlockInputs from "./TextBlockInputs.js";
import TextInputBlockInputs from "./TextInputBlockInputs.js";
import PhoneInputBlockInputs from "./PhoneInputBlockInputs.js";
import ButtonBlockInputs from "./ButtonBlockInputs.js";

const blockInputs = {
  EmptyBlock: null,
  Image: <ImageBlockInputs />,
  Text: <TextBlockInputs />,
  TextInput: <TextInputBlockInputs />,
  PhoneInput: <PhoneInputBlockInputs />,
  Button: <ButtonBlockInputs />,
};

export default blockInputs;
