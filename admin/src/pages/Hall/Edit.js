import * as React from "react";
import {
	Edit,
	SimpleForm,
	TextInput,
	ReferenceInput,
	required,
	SelectInput,
	NumberInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editHall = () => (
	<Edit
		title={<Title source="name" />}
		mutationMode="pessimistic"
		redirect="show"
	>
		<SimpleForm toolbar={<CustomToolbar />}>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="name"
				validate={[required()]}
			/>
			<NumberInput source="places" validate={[required()]} />
			<ReferenceInput source="location_id" reference="Location">
				<SelectInput optionText="name" optionValue="id" />
			</ReferenceInput>
		</SimpleForm>
	</Edit>
);

export default editHall;
