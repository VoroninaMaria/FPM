import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  SelectInput,
  ReferenceInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createTag = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default createTag;
