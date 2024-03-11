import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  SelectInput,
  required,
} from "react-admin";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editPaymentGateway = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="name" />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(PAYMENT_GATEWAY_STATUSES).map((status) => ({
          id: status,
          name: `resources.PaymentGateway.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Edit>
);

export default editPaymentGateway;
