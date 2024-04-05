import {
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  Datagrid,
  FunctionField,
  useTranslate,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import * as React from "react";

const showMembership = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <NumberField source="price" />
        <NumberField source="term" />
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="location_id" reference="Location" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="file_id" reference="File" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ArrayField source="abilities">
          <Datagrid optimized bulkActionButtons={null}>
            <TextField source="name" />
            <TextField source="regular_price" />
            <TextField source="discount_price" />
            <TextField source="description" />
            <TextField source="description1" />
            <TextField source="description2" />
          </Datagrid>
        </ArrayField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Membership.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showMembership;
