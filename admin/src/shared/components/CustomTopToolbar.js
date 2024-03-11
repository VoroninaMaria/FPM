import { CreateButton, TopToolbar, ListButton, EditButton } from "react-admin";

export const CreateOnlyTopToolbar = () => (
  <TopToolbar>
    <CreateButton sx={{ color: "rgb(110, 57, 0)", fontSize: "0.855rem" }} />
  </TopToolbar>
);

export const ShowOnlyTopToolbar = () => (
  <TopToolbar>
    <ListButton sx={{ color: "rgb(110, 57, 0)", fontSize: "0.855rem" }} />
    <EditButton sx={{ color: "rgb(110, 57, 0)", fontSize: "0.855rem" }} />
  </TopToolbar>
);

export const ShowOnlyNoEditTopToolbar = () => (
  <TopToolbar>
    <ListButton sx={{ color: "rgb(110, 57, 0)", fontSize: "0.855rem" }} />
  </TopToolbar>
);

export default {
  CreateOnlyTopToolbar,
  ShowOnlyTopToolbar,
  ShowOnlyNoEditTopToolbar,
};
