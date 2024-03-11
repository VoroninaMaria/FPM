import * as React from "react";
import { Show, SimpleShowLayout, TextField, ReferenceField } from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showPromotion = () => (
  <Show title={<Title source="title" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="text" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="file_id" reference="File" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="start_date" />
      <DateField source="end_date" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showPromotion;
