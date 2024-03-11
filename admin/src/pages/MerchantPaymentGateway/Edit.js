import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  ReferenceField,
  SelectInput,
  required,
  BooleanInput,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";
import { MERCHANT_PAYMENT_GATEWAY_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editMerchantPaymentGateway = () => (
  <Edit
    redirect="show"
    title={<Title source="name" />}
    mutationMode="pessimistic"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <ReferenceField
        source="payment_gateway_id"
        reference="PaymentGateway"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <BooleanInput source="default" />
      <JsonInput
        source="config"
        reactJsonOptions={{
          name: null,
          collapsed: false,
          enableClipboard: false,
          displayDataTypes: false,
        }}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(MERCHANT_PAYMENT_GATEWAY_STATUSES).map(
          (status) => ({
            id: status,
            name: `resources.MerchantPaymentGateway.source.status.${status}`,
          })
        )}
      />
    </SimpleForm>
  </Edit>
);

export default editMerchantPaymentGateway;
