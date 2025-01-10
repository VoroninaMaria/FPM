import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  required,
  SelectInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editLocation = () => (
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
      <ReferenceInput source="file_id" reference="File">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="address"
        validate={[required()]}
      />
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default editLocation;
