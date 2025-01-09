import * as React from "react";
import {
	Edit,
	SimpleForm,
	TextInput,
	ReferenceInput,
	required,
	SelectInput,
	ReferenceArrayInput,
	SelectArrayInput,
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
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="description"
				validate={[required()]}
			/>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="start_date"
				validate={[required()]}
			/>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="age"
				validate={[required()]}
			/>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="duration"
				validate={[required()]}
			/>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="main_roles"
				validate={[required()]}
			/>
			<ReferenceArrayInput source="categories_ids" reference="Category">
				<SelectArrayInput optionText="name" optionValue="id" />
			</ReferenceArrayInput>

			<ReferenceInput source="file_id" reference="File">
				<SelectInput optionText="name" optionValue="id" />
			</ReferenceInput>
		</SimpleForm>
	</Edit>
);

export default editMovie;
