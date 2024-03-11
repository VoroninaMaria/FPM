import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
  ReferenceField,
  ImageField,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showBrand = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <ReferenceField source="logo_file_id" reference="File">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Brand.source.status.${record.status}`)
          }
        />
        <ReferenceField source="logo_file_id" reference="File">
          <ImageField source="url" />
        </ReferenceField>
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showBrand;
