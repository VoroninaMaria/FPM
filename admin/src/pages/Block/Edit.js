import * as React from "react";
import {
  Edit,
  TabbedForm,
  TextInput,
  SelectInput,
  required,
  useEditContext,
  ReferenceInput,
  minValue,
  maxValue,
} from "react-admin";
import PropTypes from "prop-types";
import { ColorInput } from "react-admin-color-picker";
import blockInputs from "./inputs/index.js";
import {
  CustomToolbar,
  Title,
  intRegex,
} from "../../shared/components/index.js";

const SetBlockType = ({ setBlockType }) => {
  const {
    record: { type },
  } = useEditContext();

  React.useEffect(() => {
    setBlockType(type);
  }, []);
};

SetBlockType.propTypes = {
  setBlockType: PropTypes.func,
};

const editBlock = () => {
  const [blockType, setBlockType] = React.useState(null);

  const blockTypeUpdateHandler = (e) => {
    setBlockType(e.target.value);
  };

  return (
    <Edit
      title={<Title source="name" />}
      mutationMode="pessimistic"
      redirect="show"
    >
      <TabbedForm toolbar={<CustomToolbar />}>
        <TabbedForm.Tab label="resources.Block.source.tab.basic">
          <SetBlockType setBlockType={setBlockType} />
          <TextInput
            inputProps={{ maxLength: 255 }}
            source="name"
            validate={[required()]}
          />
          <ReferenceInput source="page_id" reference="Page">
            <SelectInput
              optionText="name"
              optionValue="id"
              validate={[required()]}
            />
          </ReferenceInput>
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
        {blockType && blockType !== "EmptyBlock" && (
          <TabbedForm.Tab label="resources.Block.source.tab.blockProps">
            {blockInputs[blockType]}
          </TabbedForm.Tab>
        )}
      </TabbedForm>
    </Edit>
  );
};

export default editBlock;
