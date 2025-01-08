import * as React from "react";
import {
	Edit,
	SimpleForm,
	TextInput,
	ReferenceInput,
	required,
	SelectInput,
	ArrayInput,
	SimpleFormIterator,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editSession = () => (
	<Edit
		title={<Title source="name" />}
		mutationMode="pessimistic"
		redirect="show"
	>
		<SimpleForm toolbar={<CustomToolbar />}>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="time"
				validate={[required()]}
			/>
			<TextInput
				inputProps={{ maxLength: 255 }}
				source="day"
				validate={[required()]}
			/>
			<ReferenceInput source="movie_id" reference="Movie">
				<SelectInput optionText="name" optionValue="id" />
			</ReferenceInput>
			<ArrayInput source="place_arr" label="Places Array">
				<SimpleFormIterator>
					<TextInput label="Place Status" />
				</SimpleFormIterator>
			</ArrayInput>
		</SimpleForm>
	</Edit>
);

export default editSession;
