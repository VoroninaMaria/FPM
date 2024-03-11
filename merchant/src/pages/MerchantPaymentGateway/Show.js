import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  useTranslate,
  FunctionField,
  BooleanField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showMerchantPaymentGateway = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <ReferenceField
          source="payment_gateway_id"
          reference="PaymentGateway"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="default" />
        <JsonField
          source="config"
          reactJsonOptions={{
            name: null,
            collapsed: true,
            enableClipboard: false,
            displayDataTypes: false,
          }}
        />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Merchant.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showMerchantPaymentGateway;
