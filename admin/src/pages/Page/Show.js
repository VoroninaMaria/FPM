import { useState } from "react";
import {
  Show,
  TabbedShowLayout,
  TextField,
  useShowContext,
  useTranslate,
} from "react-admin";
import Iframe from "react-iframe";
import { ColorField } from "react-admin-color-picker";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import Config from "../../config.js";

const PagePreview = () => {
  const {
    record: { id: pageId },
  } = useShowContext();

  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick(true);
  };

  const t = useTranslate();

  return (
    <>
      {click === true && (
        <div className="block-preview-container">
          <Iframe
            url={`${Config.frontendUrl}admin/Block?displayedFilters=%7B%7D&filter=%7B%22page_id%22%3A%22${pageId}%22%7D`}
            width="1170px"
            height="700px"
            id=""
            className=""
            display="flex"
            position="relative"
            scrolling="none"
            styles={{ border: "none", borderBottom: "1px solid grey" }}
          />
        </div>
      )}
      <div className="page-preview-container">
        <Iframe
          url={`${Config.clientUrl}preview/${pageId}`}
          width="400px"
          height="640px"
          id=""
          className=""
          display="flex"
          position="relative"
        />
        <div
          style={{
            flexDirection: "row",
          }}
        >
          {click === false ? (
            <button className="block-edit-button" onClick={handleClick}>
              {t("buttons.edit")}
            </button>
          ) : (
            <button
              className="block-edit-button"
              onClick={() => setClick(false)}
            >
              {t("buttons.close_editing")}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const showPage = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="resources.Page.source.tab.basic">
        <TextField source="name" />
        <ColorField source="styles.backgroundColor" />
        <ColorField source="styles.color" />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="resources.Page.source.tab.preview">
        <div className="p_container">
          <PagePreview />
        </div>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);

export default showPage;
