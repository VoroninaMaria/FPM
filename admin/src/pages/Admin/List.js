import {
  List,
  Datagrid,
  TextField,
  ShowButton,
  EditButton,
  TopToolbar,
} from "react-admin";
import { DateField } from "../../shared/components/index.js";

const listAdmin = () => (
  <List actions={<TopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="login" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
    </Datagrid>
  </List>
);

export default listAdmin;
