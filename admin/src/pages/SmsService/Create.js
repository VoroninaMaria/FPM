import * as React from "react";
import {
  Create,
  SimpleForm,
  required,
  SelectInput,
  TextInput,
  ReferenceInput,
} from "react-admin";
import SmsConnectors from "@local/connectors/sms/index.js";
import { SMS_SERVICE_STATUSES } from "@local/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";

const createSmsService = () => (
  <Create redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <SelectInput
        source="service_name"
        choices={Object.keys(SmsConnectors).map((key) => ({
          id: key,
          name: key,
        }))}
        validate={[required()]}
      />
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="config.key"
        validate={[required()]}
      />
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="config.sender"
        validate={[required()]}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(SMS_SERVICE_STATUSES).map((status) => ({
          id: status,
          name: `resources.SmsService.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createSmsService;
