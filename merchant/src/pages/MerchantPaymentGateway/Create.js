import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
  TextInput,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";
import {
  MERCHANT_PAYMENT_GATEWAY_STATUSES,
  PAYMENT_GATEWAY_STATUSES,
} from "@local/app/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";

const createMerchantPaymentGateway = () => {
  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <ReferenceInput
          source="payment_gateway_id"
          reference="PaymentGateway"
          filter={{ status: PAYMENT_GATEWAY_STATUSES.active.name }}
        >
          <SelectInput
            optionText="name"
            optionValue="id"
            source="payment_gateway_id"
            validate={[required()]}
          />
        </ReferenceInput>
        <TextInput
          source="name"
          validate={[required()]}
          inputProps={{ maxLength: 64 }}
        />
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
              name: `resources.Merchant.source.status.${status}`,
            })
          )}
        />
      </SimpleForm>
    </Create>
  );
};

export default createMerchantPaymentGateway;
