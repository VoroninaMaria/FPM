import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  FunctionField,
  ShowButton,
  NumberField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listTruncs = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
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
      <ShowButton className="button-show" />
    </Datagrid>
  </List>
);

export default listTruncs;
