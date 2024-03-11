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
  DeleteButton,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listPage = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="name" />
      <ReferenceField source="design_id" reference="Design" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ColorField source="styles.color" sortable={false} />
      <ColorField source="styles.backgroundColor" sortable={false} />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default listPage;
