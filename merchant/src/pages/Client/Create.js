import * as React from "react";
import {
  Create,
  SimpleForm,
  required,
  SelectInput,
  TextInput,
  PasswordInput,
  ReferenceInput,
  ReferenceArrayInput,
  SelectArrayInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createClient = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 12 }}
        source="phone"
        validate={[required()]}
      />
      <TextInput inputProps={{ maxLength: 64 }} source="email" />
      <TextInput inputProps={{ maxLength: 64 }} source="first_name" />
      <TextInput inputProps={{ maxLength: 64 }} source="last_name" />
      <PasswordInput source="password" validate={[required()]} />
      <ReferenceInput source="category_id" reference="Category">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
      <ReferenceInput source="membership_id" reference="Membership">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
      <ReferenceArrayInput source="tag_ids" reference="Tag">
        <SelectArrayInput optionText="name" optionValue="id" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export default createClient;
