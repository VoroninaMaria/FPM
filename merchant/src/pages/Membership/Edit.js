import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  required,
  NumberInput,
  ReferenceInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";
import { MEMBERSHIP_STATUSES } from "@local/constants/index.js";

const validatePrice = (value) => {
  if (value < 0 || value > 100000) {
    return "0 - 100000";
  }
};

const validateTerm = (value) => {
  if (value < 0 || value > 365) {
    return "0 - 365";
  }
};

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
      <NumberInput source="price" validate={[required(), validatePrice]} />
      <NumberInput source="term" validate={[required(), validateTerm]} />
      <ReferenceInput source="location_id" reference="Location">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ReferenceInput source="file_id" reference="File">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(MEMBERSHIP_STATUSES).map((status) => ({
          id: status,
          name: `resources.Membership.source.status.${status}`,
        }))}
      />
      <ArrayInput source="abilities">
        <SimpleFormIterator inline disableClear>
          <TextInput
            source="name"
            label="resources.Membership.abilities.name"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <TextInput
            source="description"
            label="resources.Membership.abilities.description"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <TextInput
            source="description1"
            label="resources.Membership.abilities.description1"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <TextInput
            source="description2"
            label="resources.Membership.abilities.description2"
            inputProps={{ maxLength: 55, minLength: 1 }}
            validate={[required()]}
          />
          <NumberInput
            source="regular_price"
            label="resources.Membership.abilities.regular_price"
            validate={[required()]}
          />
          <NumberInput
            source="discount_price"
            label="resources.Membership.abilities.discount_price"
            validate={[required()]}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default editMembership;
