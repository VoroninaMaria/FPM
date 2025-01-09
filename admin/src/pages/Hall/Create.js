import * as React from "react";
import {
	Create,
	SimpleForm,
	SelectInput,
	TextInput,
	NumberInput,
	ReferenceInput,
	required,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createHall = () => (
	<Create redirect="show">
		<SimpleForm toolbar={<CustomToolbar />}>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="name"
				validate={[required()]}
			/>
			<NumberInput source="places" validate={[required()]} />
			<NumberInput source="min_price" validate={[required()]} />
			<ReferenceInput source="location_id" reference="Location">
				<SelectInput
					optionText="name"
					optionValue="id"
					validate={[required()]}
				/>
			</ReferenceInput>
		</SimpleForm>
	</Create>
);

export default createHall;
