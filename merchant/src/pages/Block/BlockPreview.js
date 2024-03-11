import {
  Admin,
  Resource,
  Layout,
  TitlePortal,
  RefreshIconButton,
} from "react-admin";
import { AppBar, Toolbar, Box } from "@mui/material/index.js";
import Providers from "../../providers/index.js";
import Block from "./index.js";

const MyAppBar = () => (
  <AppBar position="static">
    <Toolbar>
      <TitlePortal />
      <Box flex="1" />
      <RefreshIconButton />
    </Toolbar>
  </AppBar>
);
const Sidebar = () => <div></div>;
const MyLayout = (props) => (
  <Layout {...props} sidebar={Sidebar} appBar={MyAppBar} />
);

const BlockPreview = () => {
  return (
    <Admin
      basename="/admin"
      layout={MyLayout}
      authProvider={Providers.authProvider}
      dataProvider={Providers.dataProvider()}
      i18nProvider={Providers.i18nProvider}
      disableTelemetry
    >
      <Resource
        name="Block"
        list={Block.List}
        show={Block.Show}
        edit={Block.Edit}
        create={Block.Create}
      />
    </Admin>
  );
};

export default BlockPreview;
