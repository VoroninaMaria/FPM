import * as React from "react";
import { Create, SimpleForm, required, SelectInput } from "react-admin";
import PaymentGateway from "@local/connectors/payment_gateways/index.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";

const createPaymentGateway = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <SelectInput
        source="name"
        choices={Object.keys(PaymentGateway).map((key) => ({
          id: key,
          name: key,
        }))}
        validate={[required()]}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(PAYMENT_GATEWAY_STATUSES).map((status) => ({
          id: status,
          name: `resources.PaymentGateway.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createPaymentGateway;
