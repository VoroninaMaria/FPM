import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
  useGetOne,
} from "react-admin";
import PropTypes from "prop-types";
import { CustomToolbar, Loader } from "../../shared/components/index.js";

const GetMerchant = ({ selectedCompany }) => {
  const {
    data: company,
    isLoading,
    error,
  } = useGetOne("Company", { id: selectedCompany });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error</div>;
  }

  return (
    <ReferenceInput
      source="client_id"
      reference="Client"
      filter={{ merchant_id: company.merchant_id }}
    >
      <SelectInput
        optionText="phone"
        optionValue="id"
        validate={[required()]}
      />
    </ReferenceInput>
  );
};

GetMerchant.propTypes = {
  selectedCompany: PropTypes.string,
};

const createManager = () => {
  const [selectedCompany, setSelectedCompany] = React.useState("");

  const handleOptionChange = (event) => {
    event.preventDefault();
    setSelectedCompany(event.target.value);
  };

  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <ReferenceInput source="company_id" reference="Company" link="show">
          <SelectInput
            optionText="name"
            value={selectedCompany}
            onChange={handleOptionChange}
            validate={[required()]}
          />
        </ReferenceInput>
        {selectedCompany && <GetMerchant selectedCompany={selectedCompany} />}
      </SimpleForm>
    </Create>
  );
};

export default createManager;
