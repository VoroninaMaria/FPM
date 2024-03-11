import * as React from "react";
import {
  Create,
  SimpleForm,
  FileInput,
  FileField,
  ReferenceInput,
  SelectInput,
  TextInput,
  required,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const CreateFile = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
      <FileInput
        source="attachments"
        accept="application/pdf,image/webp,image/png,image/svg+xml"
        maxSize={10485760}
        validate={[required()]}
      >
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Create>
);

export default CreateFile;
