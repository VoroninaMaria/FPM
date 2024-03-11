import {
  List,
  Datagrid,
  TextField,
  ShowButton,
  EditButton,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  useTranslate,
  FunctionField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listClients = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="phone" />
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="first_name" />
        <TextField source="last_name" />
        <TextField source="email" />
        <ReferenceField source="category_id" reference="Category" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceArrayField source="tag_ids" reference="Tag">
          <SingleFieldList linkType="show">
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
        <ReferenceField source="company_id" reference="Company" link="show">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Client.source.status.${record.status}`)
          }
        />
        <JsonField
          reference="Changes"
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
          reactJsonOptions={{
            name: null,
            collapsed: true,
            enableClipboard: false,
            displayDataTypes: false,
          }}
          sortable={false}
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listClients;
