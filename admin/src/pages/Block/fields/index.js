import ImageBlockFields from "./ImageBlockFields.js";
import TextBlockFields from "./TextBlockFields.js";
import TextInputBlockFields from "./TextInputBlockFields.js";
import PhoneInputBlockFields from "./PhoneInputBlockFields.js";
import ButtonBlockFields from "./ButtonBlockFields.js";

const blockFields = {
  EmptyBlock: null,
  Image: <ImageBlockFields />,
  Text: <TextBlockFields />,
  TextInput: <TextInputBlockFields />,
  PhoneInput: <PhoneInputBlockFields />,
  Button: <ButtonBlockFields />,
};

export default blockFields;
