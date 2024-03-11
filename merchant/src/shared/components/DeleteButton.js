import { useState } from "react";
import {
  Button,
  Confirm,
  useRecordContext,
  useDelete,
  useNotify,
  useRefresh,
  useResourceContext,
  useTranslate,
} from "react-admin";
import { Delete } from "@mui/icons-material/index.js";

const DeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const t = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const [remove, { isLoading }] = useDelete(
    resource,
    {
      id: record && record.id,
    },
    {
      onError: ({ message }) => {
        return (
          notify(`resources.notifications.errors.${message}`, {
            type: "error",
          }),
          refresh()
        );
      },
    }
  );

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const handleConfirm = () => {
    remove();
  };

  return (
    <>
      <Button
        label="buttons.delete"
        onClick={handleClick}
        className="button-delete"
      >
        <Delete fontSize="small" sx={{ color: "#d10000" }} />
      </Button>
      <Confirm
        isOpen={open}
        loading={isLoading}
        title={
          t("buttons.delete") + ` #${record && (record.name || record.title)}`
        }
        content="resources.notifications.confirm.delete"
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default DeleteButton;
