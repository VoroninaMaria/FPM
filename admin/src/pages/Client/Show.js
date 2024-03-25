import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  useTranslate,
  FunctionField,
  ArrayField,
  Datagrid,
} from "react-admin";

import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showClient = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="phone" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="phone" />
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="first_name" />
        <TextField source="last_name" />
        <TextField source="email" />
        <ReferenceField source="category_id" reference="Category" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceArrayField source="tag_ids" reference="Tag">
          <SingleFieldList linkType="show">
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
        <ReferenceField
          source="membership_id"
          reference="Membership"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Client.source.status.${record.status}`)
          }
        />
        <ArrayField
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
        >
          <Datagrid optimized bulkActionButtons={null}>
            <TextField
              source="field_name"
              label="resources.Client.fields.unconfirmed_changes.field_name"
            />
            <TextField
              source="value"
              label="resources.Client.fields.unconfirmed_changes.value"
            />
            <FunctionField
              source="status"
              render={(record) =>
                t(`resources.Client.source.changes_status.${record.status}`)
              }
            />
          </Datagrid>
        </ArrayField>
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showClient;
