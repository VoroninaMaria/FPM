import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  required,
  NumberInput,
  SelectInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const validatePercentage = (value) => {
  if (value < 0 || value > 100) {
    return "0 - 100";
  }
};

const editDiscount = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
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
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default editDiscount;
