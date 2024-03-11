import * as React from "react";
import {
  TextInput,
  SelectInput,
  NumberInput,
  required,
  minValue,
  maxValue,
  ReferenceInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";

const ButtonBlockInputs = () => (
  <React.Fragment>
    <TextInput
      inputProps={{ maxLength: 20 }}
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
    <TextInput inputProps={{ maxLength: 20 }} source="props.action" />
    <ReferenceInput source="props.redirect_page_id" reference="Page">
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
    <SelectInput
      source="styles.textAlign"
      defaultValue="center"
      choices={[
        { id: "center", name: "directions.center" },
        { id: "start", name: "directions.left" },
        { id: "end", name: "directions.right" },
      ]}
      translateChoice={true}
      validate={[required()]}
      id="block_select_page_id"
    />
    <ColorInput source="styles.backgroundColor" picker="Photoshop" />
    <ColorInput source="styles.borderColor" picker="Photoshop" />
    <NumberInput
      source="styles.borderWidth"
      defaultValue={1}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.width"
      defaultValue={100}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.height"
      defaultValue={100}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
    <NumberInput
      source="styles.borderRadius"
      defaultValue={10}
      min={0}
      max={100}
      validate={[required(), minValue(0), maxValue(100)]}
    />
  </React.Fragment>
);

export default ButtonBlockInputs;
