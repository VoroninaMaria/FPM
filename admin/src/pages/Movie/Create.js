import * as React from "react";
import {
	Create,
	SimpleForm,
	SelectInput,
	TextInput,
	ReferenceInput,
	required,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createMovie = () => (
	<Create redirect="show">
		<SimpleForm toolbar={<CustomToolbar />}>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="name"
				validate={[required()]}
			/>
			<ReferenceInput source="category_id" reference="Category">
				<SelectInput
					optionText="name"
					optionValue="id"
					validate={[required()]}
				/>
			</ReferenceInput>
			<ReferenceInput source="file_id" reference="File">
				<SelectInput
					optionText="name"
					optionValue="id"
					validate={[required()]}
				/>
			</ReferenceInput>
		</SimpleForm>
	</Create>
);

export default createMovie;
