import * as React from "react";
import {
  TextInput,
  required,
  NumberInput,
  SelectInput,
  minValue,
  maxValue,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";

const TextInputBlockInputs = () => (
  <React.Fragment>
    <TextInput
      inputProps={{ maxLength: 255 }}
      source="props.text"
      validate={[required()]}
    />
    <NumberInput
      source="styles.fontWeight"
      type="number"
      min={100}
      max={900}
      step={100}
      defaultValue={500}
      validate={[required(), minValue(100), maxValue(900)]}
    />
    <NumberInput
      source="styles.fontSize"
      type="number"
      min={1}
      max={1000}
      defaultValue={16}
      validate={[required(), minValue(1), maxValue(1000)]}
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
    <ColorInput source="styles.backgroundColor" picker="Photoshop" />
    <ColorInput source="styles.placeholderTextColor" picker="Photoshop" />
    <ColorInput source="styles.borderColor" picker="Photoshop" />
    <NumberInput
      source="styles.borderWidth"
      type="number"
      defaultValue={1}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.width"
      type="number"
      defaultValue={100}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.height"
      type="number"
      defaultValue={100}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.borderRadius"
      type="number"
      defaultValue={10}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
  </React.Fragment>
);

export default TextInputBlockInputs;
