import * as React from "react";
import {
	Edit,
	SimpleForm,
	TextInput,
	ReferenceInput,
	required,
	SelectInput,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editMovie = () => (
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
			<ReferenceInput source="category_id" reference="Category">
				<SelectInput optionText="name" optionValue="id" />
			</ReferenceInput>
			<ReferenceInput source="file_id" reference="File">
				<SelectInput optionText="name" optionValue="id" />
			</ReferenceInput>
		</SimpleForm>
	</Edit>
);

export default editMovie;
