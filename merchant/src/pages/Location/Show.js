import { Show, SimpleShowLayout, TextField } from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showLocations = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="address" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showLocations;
