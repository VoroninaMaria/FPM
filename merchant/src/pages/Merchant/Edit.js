import * as React from "react";
import {
  ReferenceInput,
  Edit,
  SimpleForm,
  TextField,
  PasswordInput,
  BooleanInput,
  SelectInput,
} from "react-admin";

import { CustomToolbar, Title } from "../../shared/components/index.js";

const editMerchant = () => {
  const [designEditorEnabled, setDesignEditorEnabled] = React.useState(false);

  React.useEffect(() => {
    const plugins = JSON.parse(localStorage.getItem("plugins"));

    setDesignEditorEnabled(plugins.designEditor);
  });

  return (
    <Edit
      redirect="show"
      title={<Title source="name" />}
      mutationMode="pessimistic"
    >
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextField source="name" />
        <BooleanInput source="newbie" />
        {designEditorEnabled && (
          <ReferenceInput source="design_id" reference="Design">
            <SelectInput optionText="name" optionValue="id" />
          </ReferenceInput>
        )}
        <PasswordInput
          inputProps={{ maxLength: 64 }}
          source="current_password"
        />

        <PasswordInput inputProps={{ maxLength: 64 }} source="new_password" />
      </SimpleForm>
    </Edit>
  );
};

export default editMerchant;
