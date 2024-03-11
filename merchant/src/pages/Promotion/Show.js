import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  ImageField,
  useRecordContext,
  FileField,
  Labeled,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const ShowImage = () => {
  const record = useRecordContext();

  return (
    <Labeled>
      {record.mimetype === "application/pdf" ? (
        <FileField
          label="resources.File.fields.link"
          source="url"
          title="name"
          target="_blank"
        />
      ) : (
        <ImageField source="url" />
      )}
    </Labeled>
  );
};

const showPromotion = () => (
  <Show title={<Title source="title" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="text" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="file_id" reference="File" link="show">
        <ShowImage />
      </ReferenceField>
      <DateField source="start_date" />
      <DateField source="end_date" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showPromotion;
