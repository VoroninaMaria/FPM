import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  FunctionField,
  NumberField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  Title,
  ShowOnlyNoEditTopToolbar,
} from "../../shared/components/index.js";

const showTruncs = () => (
  <Show title={<Title source="title" />} actions={<ShowOnlyNoEditTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="title" />
      <ReferenceField
        source="merchant_payment_gateway_id"
        reference="MerchantPaymentGateway"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="client_id" reference="Client" link="show">
        <TextField source="phone" />
      </ReferenceField>
      <TextField source="description" />
      <TextField source="short_description" />
      <NumberField source="amount" />
      <JsonField
        source="transactions"
        reactJsonOptions={{
          name: null,
          collapsed: true,
          enableClipboard: false,
          displayDataTypes: false,
        }}
        sortable={false}
      />
      <FunctionField source="status" render={(record) => record.status} />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showTruncs;
