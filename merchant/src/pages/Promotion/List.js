import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  ShowButton,
  EditButton,
} from "react-admin";
import {
  DateField,
  DeleteButton,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listPromotion = () => (
  <List actions={<CreateOnlyTopToolbar />}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="title" />
      <ReferenceField source="file_id" reference="File" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="start_date" />
      <DateField source="end_date" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
      <EditButton className="button-edit" />
      <DeleteButton mutationMode="pessimistic" className="button-delete" />
    </Datagrid>
  </List>
);

export default listPromotion;
