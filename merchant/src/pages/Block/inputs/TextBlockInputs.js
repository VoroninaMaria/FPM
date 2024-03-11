import * as React from "react";
import {
  TextInput,
  NumberInput,
  SelectInput,
  required,
  minValue,
  maxValue,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";

const TextBlockInputs = () => (
  <React.Fragment>
    <TextInput
      multiline
      inputProps={{ maxLength: 255 }}
      source="props.text"
      validate={[required()]}
    />
    <NumberInput
      source="styles.fontWeight"
      min={0}
      max={900}
      step={100}
      defaultValue={500}
      validate={[minValue(1), maxValue(900)]}
    />
    <NumberInput
      source="styles.fontSize"
      min={0}
      max={1000}
      defaultValue={16}
      validate={[minValue(1), maxValue(1000)]}
    />
    <SelectInput
      source="styles.fontStyle"
      defaultValue="normal"
      choices={[
        { id: "normal", name: "fontStyle.normal" },
        { id: "italic", name: "fontStyle.italic" },
      ]}
      translateChoice={true}
    />
    <ColorInput
      source="styles.color"
      picker="Photoshop"
      defaultValue="#000000"
    />
    <SelectInput
      source="styles.textAlign"
      defaultValue="center"
      choices={[
        { id: "center", name: "directions.center" },
        { id: "start", name: "directions.left" },
        { id: "end", name: "directions.right" },
      ]}
      translateChoice={true}
    />
  </React.Fragment>
);

export default TextBlockInputs;
