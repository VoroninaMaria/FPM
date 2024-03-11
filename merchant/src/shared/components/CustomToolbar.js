import { Toolbar, SaveButton, useNotify, useRefresh } from "react-admin";

const SaveError = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();

  const onError = ({ message }) => {
    return (
      notify(`resources.notifications.errors.${message}`, {
        type: "error",
      }),
      refresh()
    );
  };

  return (
    <Toolbar
      {...props}
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <SaveButton type="button" mutationOptions={{ onError }} />
    </Toolbar>
  );
};

export default SaveError;
