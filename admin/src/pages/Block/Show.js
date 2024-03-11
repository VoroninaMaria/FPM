import * as React from "react";
import {
  Show,
  TabbedShowLayout,
  TextField,
  ReferenceField,
  useShowContext,
  NumberField,
  useTranslate,
  FunctionField,
} from "react-admin";
import PropTypes from "prop-types";
import { ColorField } from "react-admin-color-picker";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import blockFields from "./fields/index.js";

const SelectedBlockFields = () => {
  const {
    record: { type },
  } = useShowContext();

  return blockFields[type];
};

const LoadBlockType = ({ setBlockType }) => {
  const {
    record: { type },
  } = useShowContext();

  React.useEffect(() => {
    setBlockType(type);
  }, []);
};

LoadBlockType.propTypes = {
  setBlockType: PropTypes.func.isRequired,
};

const showBlock = () => {
  const [blockType, setBlockType] = React.useState(null);
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="resources.Block.source.tab.basic">
          <LoadBlockType setBlockType={setBlockType} />
          <TextField source="name" />
          <ReferenceField source="page_id" reference="Page" link="show">
            <TextField source="name" />
          </ReferenceField>
          <FunctionField
            source="type"
            render={(record) => t(`resources.Block.source.type.${record.type}`)}
          />
          <NumberField source="position" />
          <NumberField source="blocks" />
          <DateField source="created_at" />
          <DateField source="updated_at" />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="resources.Block.source.tab.containerStyles">
          <ColorField source="container_styles.backgroundColor" />
          <FunctionField
            source="container_styles.alignItems"
            render={(record) =>
              t(`alignItems.${record.container_styles.alignItems}`)
            }
          />
          <FunctionField
            source="container_styles.justifyContent"
            render={(record) =>
              t(`justifyContent.${record.container_styles.justifyContent}`)
            }
          />
        </TabbedShowLayout.Tab>
        {blockType !== "EmptyBlock" && (
          <TabbedShowLayout.Tab label="resources.Block.source.tab.blockProps">
            <SelectedBlockFields />
          </TabbedShowLayout.Tab>
        )}
      </TabbedShowLayout>
    </Show>
  );
};

export default showBlock;
