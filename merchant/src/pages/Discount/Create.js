import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  NumberInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const validatePercentage = (value) => {
  if (value < 0 || value > 100) {
    return "0 - 100";
  }
};

const createDiscount = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <NumberInput
        source="percent"
        validate={[required(), validatePercentage]}
      />
    </SimpleForm>
  </Create>
);

export default createDiscount;
