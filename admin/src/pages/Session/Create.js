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

const createSession = () => {
	const [selectedLocation, setSelectedLocation] = React.useState("");

	const handleOptionChange = (event) => {
		event.preventDefault();
		setSelectedLocation(event.target.value);
	};

	return (
		<Create redirect="show">
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
					<SelectInput
						optionText="name"
						optionValue="id"
						validate={[required()]}
					/>
				</ReferenceInput>
				<ReferenceInput source="location_id" reference="Location">
					<SelectInput
						optionText="name"
						value={selectedLocation}
						onChange={handleOptionChange}
						validate={[required()]}
					/>
				</ReferenceInput>
				{selectedLocation && (
					<>
						<ReferenceInput
							source="hall_id"
							reference="Hall"
							filter={{ location_id: selectedLocation }}
						>
							<SelectInput
								optionText="name"
								optionValue="id"
								validate={[required()]}
							/>
						</ReferenceInput>
					</>
				)}
			</SimpleForm>
		</Create>
	);
};

export default createSession;
