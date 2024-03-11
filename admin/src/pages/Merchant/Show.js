import {
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
  NumberField,
  ReferenceField,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import { JsonField } from "react-admin-json-view";

const showMerchant = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="login" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Merchant.source.status.${record.status}`)
          }
        />
        <ReferenceField source="design_id" reference="Design" link="show">
          <TextField source="name" />
        </ReferenceField>
        <NumberField source="storage_capacity" />
        <JsonField
          label="resources.Merchant.source.plugins"
          source="plugins"
          reactJsonOptions={{
            name: null,
            sortKeys: true,
            collapsed: true,
            quotesOnKeys: false,
            enableClipboard: false,
            displayDataTypes: false,
          }}
          sortable={false}
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showMerchant;
