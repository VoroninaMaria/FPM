import { Show, SimpleShowLayout, TextField } from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showAdmin = () => (
  <Show title={<Title source="login" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="login" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showAdmin;
