import * as React from "react";
import {
  ImageField,
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  useTranslate,
  FunctionField,
  useRecordContext,
  FileField,
  Labeled,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyNoEditTopToolbar,
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

const ShowFile = () => {
  const t = useTranslate();

  return (
    <Show
      title={<Title source="name" />}
      actions={<ShowOnlyNoEditTopToolbar />}
    >
      <SimpleShowLayout>
        <TextField source="name" />
        <FunctionField
          source="mimetype"
          render={(record) =>
            t(`resources.File.source.mimetype.${record.mimetype}`)
          }
        />
        <NumberField source="size" />
        <ShowImage />
        <DateField source="created_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default ShowFile;
