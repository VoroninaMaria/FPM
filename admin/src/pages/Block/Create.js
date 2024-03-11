import * as React from "react";
import {
  Create,
  TextInput,
  required,
  SelectInput,
  ReferenceInput,
  TabbedForm,
  minValue,
  maxValue,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";
import { CustomToolbar, intRegex } from "../../shared/components/index.js";
import blockInputs from "./inputs/index.js";

const createBlock = () => {
  const [selectedBlockInputs, setSelectedBlockInputs] = React.useState(null);

  const blockTypeUpdateHandler = (event) => {
    setSelectedBlockInputs(blockInputs[event.target.value]);
  };

  return (
    <Create redirect="show">
      <TabbedForm toolbar={<CustomToolbar />}>
        <TabbedForm.Tab label="resources.Block.source.tab.basic">
          <TextInput
            inputProps={{ maxLength: 255 }}
            source="name"
            validate={[required()]}
          />
          <SelectInput
            source="type"
            choices={[
              { id: "Button", name: "resources.Block.source.type.Button" },
              {
                id: "EmptyBlock",
                name: "resources.Block.source.type.EmptyBlock",
              },
              { id: "Image", name: "resources.Block.source.type.Image" },
              {
                id: "PhoneInput",
                name: "resources.Block.source.type.PhoneInput",
              },
              { id: "Text", name: "resources.Block.source.type.Text" },
              {
                id: "TextInput",
                name: "resources.Block.source.type.TextInput",
              },
            ]}
            validate={[required()]}
            onChange={blockTypeUpdateHandler}
          />
          <ReferenceInput source="page_id" reference="Page">
            <SelectInput
              optionText="name"
              optionValue="id"
              validate={[required()]}
            />
          </ReferenceInput>
          <TextInput
            source="position"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            validate={[intRegex, required(), minValue(1), maxValue(10)]}
          />
          <TextInput
            source="blocks"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            validate={[intRegex, required(), minValue(1), maxValue(10)]}
          />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="resources.Block.source.tab.containerStyles">
          <ColorInput
            source="container_styles.backgroundColor"
            picker="Photoshop"
          />
          <SelectInput
            source="container_styles.alignItems"
            defaultValue="center"
            choices={[
              { id: "center", name: "directions.center" },
              { id: "flex-start", name: "directions.top" },
              { id: "flex-end", name: "directions.bottom" },
            ]}
            validate={[required()]}
          />
          <SelectInput
            source="container_styles.justifyContent"
            defaultValue="center"
            choices={[
              { id: "center", name: "directions.center" },
              { id: "flex-start", name: "directions.left" },
              { id: "flex-end", name: "directions.right" },
            ]}
            translateChoice={true}
            validate={[required()]}
          />
        </TabbedForm.Tab>
        {selectedBlockInputs && (
          <TabbedForm.Tab label="resources.Block.source.tab.blockProps">
            {selectedBlockInputs}
          </TabbedForm.Tab>
        )}
      </TabbedForm>
    </Create>
  );
};

export default createBlock;
