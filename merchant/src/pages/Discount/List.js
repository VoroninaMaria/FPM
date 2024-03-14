import {
  Datagrid,
  List,
  TextField,
  NumberField,
  ShowButton,
  EditButton,
} from "react-admin";
import {
  DateField,
  DeleteButton,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listCategory = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="name" />
      <NumberField source="percent" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
      <DeleteButton className="button-delete" />
    </Datagrid>
  </List>
);

export default listCategory;
