import * as React from "react";
import {
	Create,
	SimpleForm,
	SelectInput,
	TextInput,
	ReferenceInput,
	required,
	ReferenceArrayInput,
	SelectArrayInput,
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
