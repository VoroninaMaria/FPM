import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  SelectInput,
  required,
} from "react-admin";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editSmsService = () => (
  <Edit
    title={<Title source="service_name" />}
    mutationMode="pessimistic"
    redirect="list"
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
