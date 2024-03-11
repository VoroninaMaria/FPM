import {
  Datagrid,
  List,
  TextField,
  ShowButton,
  EditButton,
  ReferenceField,
} from "react-admin";
import { ColorField } from "react-admin-color-picker";
import {
  DateField,
  CreateOnlyTopToolbar,
  DeleteButton,
} from "../../shared/components/index.js";

const listDesign = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="name" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ColorField source="styles.color" sortable={false} />
      <ColorField source="styles.backgroundColor" sortable={false} />
      <ReferenceField source="default_page_id" reference="Page" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="error_page_id" reference="Page" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField
        source="authenticated_page_id"
        reference="Page"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="loader_page_id" reference="Page" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
      <DeleteButton mutationMode="pessimistic" className="button-delete" />
    </Datagrid>
  </List>
);

export default listDesign;
