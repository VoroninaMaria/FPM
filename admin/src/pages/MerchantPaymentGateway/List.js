import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
  BooleanField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listMerchantPaymentGateways = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="name" />
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
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
          sortable={false}
        />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.MerchantPaymentGateway.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listMerchantPaymentGateways;
