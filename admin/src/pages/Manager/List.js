import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  ShowButton,
} from "react-admin";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listManagers = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <ReferenceField source="company_id" reference="Company" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="client_id" reference="Client" link="show">
        <TextField source="phone" />
      </ReferenceField>
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
    </Datagrid>
  </List>
);

export default listManagers;
