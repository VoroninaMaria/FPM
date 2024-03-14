import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  required,
  NumberInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

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
      <NumberInput source="percent" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export default editDiscount;
