import * as React from "react";
import { required, NumberInput, minValue, maxValue } from "react-admin";
import { ColorInput } from "react-admin-color-picker";

const PhoneInputBlockInputs = () => (
  <React.Fragment>
    <ColorInput source="styles.color" picker="Photoshop" />
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

export default PhoneInputBlockInputs;
