import * as React from "react";
import {
  Edit,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
  useEditContext,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const EditDesignFilter = () => {
  const { record } = useEditContext();

  return (
    <>
      <ReferenceInput
        source="default_page_id"
        reference="Page"
        validate={[required()]}
        filter={{
          design_id: record.id,
        }}
      >
        <SelectInput
          optionText="name"
          optionValue="id"
          id="block_select_page_id"
        />
      </ReferenceInput>
      <ReferenceInput
        source="authenticated_page_id"
        reference="Page"
        validate={[required()]}
        filter={{
          design_id: record.id,
        }}
      >
        <SelectInput
          optionText="name"
          optionValue="id"
          id="block_select_page_id"
        />
      </ReferenceInput>
      <ReferenceInput
        source="loader_page_id"
        reference="Page"
        validate={[required()]}
        filter={{
          design_id: record.id,
        }}
      >
        <SelectInput
          optionText="name"
          optionValue="id"
          id="block_select_page_id"
        />
      </ReferenceInput>
      <ReferenceInput
        source="error_page_id"
        reference="Page"
        validate={[required()]}
        filter={{
          design_id: record.id,
        }}
      >
        <SelectInput
          optionText="name"
          optionValue="id"
          id="block_select_page_id"
        />
      </ReferenceInput>
    </>
  );
};

const editDesign = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <EditDesignFilter />
      <ColorInput
        source="styles.color"
        picker="Photoshop"
        validate={[required()]}
      />
      <ColorInput
        source="styles.backgroundColor"
        picker="Photoshop"
        validate={[required()]}
      />

      <SelectInput
        source="styles.alignItems"
        defaultValue="center"
        choices={[
          { id: "center", name: "directions.center" },
          { id: "flex-start", name: "directions.top" },
          { id: "flex-end", name: "directions.bottom" },
        ]}
        validate={required()}
      />
      <SelectInput
        source="styles.justifyContent"
        defaultValue="center"
        choices={[
          { id: "center", name: "directions.center" },
          { id: "flex-start", name: "directions.left" },
          { id: "flex-end", name: "directions.right" },
        ]}
        translateChoice={true}
        validate={required()}
      />
    </SimpleForm>
  </Edit>
);

export default editDesign;
