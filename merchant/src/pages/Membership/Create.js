import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  ReferenceInput,
  NumberInput,
  SelectInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";
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

const createMembership = () => (
  <Create redirect="show">
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
    </SimpleForm>
  </Create>
);

export default createMembership;
