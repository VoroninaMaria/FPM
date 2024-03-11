import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  SelectInput,
  required,
} from "react-admin";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editSmsService = () => (
  <Edit
    redirect="list"
    title={<Title source="service_name" />}
    mutationMode="pessimistic"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="service_name" />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(SMS_SERVICE_STATUSES).map((status) => ({
          id: status,
          name: `resources.SmsService.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Edit>
);

export default editSmsService;
