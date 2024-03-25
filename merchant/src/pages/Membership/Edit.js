import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  required,
  NumberInput,
  ReferenceInput,
  SelectInput,
  DateTimeInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editMembership = () => (
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
      <ArrayInput source="abilities">
        <SimpleFormIterator inline disableClear>
          <TextInput
            source="name"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <TextInput
            source="description"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <NumberInput source="regular_price" validate={[required()]} />
          <NumberInput source="discount_price" validate={[required()]} />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default editMembership;
