import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  ShowButton,
  EditButton,
  NumberField,
} from "react-admin";
import {
  DateField,
  DeleteButton,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listMembership = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="name" />
      <NumberField source="price" />
      <ReferenceField source="location_id" reference="Location" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
      <DeleteButton className="button-delete" />
    </Datagrid>
  </List>
);

export default listMembership;
