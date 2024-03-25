import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  ReferenceInput,
  NumberInput,
  DateTimeInput,
  SelectInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createMembership = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <NumberInput source="price" validate={[required()]} />
      <ReferenceInput source="location_id" reference="Location">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <DateTimeInput source="start_date" validate={[required()]} />
      <DateTimeInput source="end_date" validate={[required()]} />
    </SimpleForm>
  </Create>
);

export default createMembership;
