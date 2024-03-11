import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listBrandMerchants = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <ReferenceField source="brand_id" reference="Brand" link="show">
          <TextField source="name" />
        </ReferenceField>
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
            t(`resources.BrandMerchant.source.status.${record.status}`)
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

export default listBrandMerchants;
