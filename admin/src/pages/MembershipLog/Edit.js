import * as React from "react";
import {
  Edit,
  SimpleForm,
  required,
  SelectInput,
  DateTimeInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";
import { MEMBERSHIP_STATUSES } from "@local/app/constants/index.js";

const editMembershipLog = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <DateTimeInput
        source="start_date"
        validate={[required()]}
        defaultValue={new Date()}
      />
      <DateTimeInput
        source="end_date"
        validate={[required()]}
        defaultValue={new Date()}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(MEMBERSHIP_STATUSES).map((status) => ({
          id: status,
          name: `resources.Membership.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Edit>
);

export default editMembershipLog;
