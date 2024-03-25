import {
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  Datagrid,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import * as React from "react";

const showMembership = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="name" />
      <NumberField source="price" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="location_id" reference="Location" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="start_date" />
      <DateField source="end_date" />
      <ArrayField source="abilities">
        <Datagrid optimized bulkActionButtons={null}>
          <TextField source="name" />
          <TextField source="regular_price" />
          <TextField source="discount_price" />
          <TextField source="description" />
        </Datagrid>
      </ArrayField>

      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showMembership;
