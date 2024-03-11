import * as React from "react";
import {
  TextField,
  NumberField,
  Labeled,
  ImageField,
  useTranslate,
  FunctionField,
  useRecordContext,
  useGetOne,
  FileField,
  ReferenceField,
} from "react-admin";
import { ColorField } from "react-admin-color-picker";

const ImageShow = () => {
  const record = useRecordContext();
  const { data, isLoading, error } = useGetOne("File", {
    id: record.props.file_id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <p>ERROR</p>;
  }

  return (
    <Labeled>
      {data.mimetype === "application/pdf" ? (
        <FileField
          label="resources.File.fields.link"
          source="props.uri"
          title="name"
          target="_blank"
        />
      ) : (
        <ImageField
          label="resources.Block.fields.props.uri"
          source="props.uri"
        />
      )}
    </Labeled>
  );
};

const ImageBlockFields = () => {
  const t = useTranslate();

  return (
    <React.Fragment>
      <Labeled label="resources.Block.fields.props.redirect_page_id">
        <ReferenceField
          source="props.redirect_page_id"
          reference="Page"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
      </Labeled>
      <ImageShow />
      <Labeled label="resources.Block.fields.styles.borderColor">
        <ColorField source="styles.borderColor" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.borderWidth">
        <NumberField source="styles.borderWidth" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.width">
        <TextField source="styles.width" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.height">
        <TextField source="styles.height" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.borderRadius">
        <NumberField source="styles.borderRadius" />
      </Labeled>

      <Labeled label="resources.Block.fields.styles.resizeMode">
        <FunctionField
          source="styles.resizeMode"
          render={(record) => t(`resizeMode.${record.styles.resizeMode}`)}
        />
      </Labeled>
    </React.Fragment>
  );
};

export default ImageBlockFields;
