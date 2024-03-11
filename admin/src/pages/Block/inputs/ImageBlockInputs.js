import * as React from "react";
import {
  ReferenceInput,
  SelectInput,
  required,
  NumberInput,
  minValue,
  maxValue,
  AutocompleteInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";

const ImageBlockInputs = () => {
  const renderOptionText = (record) => (
    <span key={record.id}>
      <img
        src={record.url}
        alt={record.name}
        width={15}
        height={15}
        style={{ marginRight: "5px" }}
      />
      {record.name}
    </span>
  );

  return (
    <React.Fragment>
      <ReferenceInput source="props.redirect_page_id" reference="Page">
        <SelectInput optionText="name" optionValue="id" />
      </ReferenceInput>
      <ReferenceInput source="props.file_id" reference="File">
        <AutocompleteInput
          inputText={(record) => record.name}
          optionText={renderOptionText}
          optionValue="id"
          debounce={10}
          validate={[required()]}
          filterToQuery={(searchText) => ({ name: searchText })}
        />
      </ReferenceInput>
      <ColorInput source="styles.borderColor" picker="Photoshop" />

      <SelectInput
        source="styles.resizeMode"
        defaultValue="contain"
        choices={[
          { id: "cover", name: "resizeMode.cover" },
          { id: "contain", name: "resizeMode.contain" },
          { id: "stretch", name: "resizeMode.stretch" },
          { id: "repeat", name: "resizeMode.repeat" },
          { id: "center", name: "resizeMode.center" },
        ]}
        validate={[required()]}
      />

      <NumberInput
        source="styles.borderWidth"
        type="number"
        defaultValue={1}
        min={0}
        max={100}
        validate={[required(), minValue(0), maxValue(100)]}
      />

      <NumberInput
        source="styles.width"
        type="number"
        defaultValue={100}
        min={0}
        max={100}
        validate={[required(), minValue(0), maxValue(100)]}
      />
      <NumberInput
        source="styles.height"
        type="number"
        defaultValue={100}
        min={0}
        max={100}
        validate={[required(), minValue(0), maxValue(100)]}
      />
      <NumberInput
        source="styles.borderRadius"
        type="number"
        defaultValue={10}
        min={0}
        max={100}
        validate={[required(), minValue(0), maxValue(100)]}
      />
    </React.Fragment>
  );
};

export default ImageBlockInputs;
