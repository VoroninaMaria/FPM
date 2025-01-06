import { ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import {
	DateField,
	Title,
	ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showHall = () => (
	<Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
		<SimpleShowLayout>
			<TextField source="name" />
			<TextField source="places" />
			<ReferenceField source="location_id" reference="Location" link="show">
				<TextField source="name" />
			</ReferenceField>
			<DateField source="created_at" />
			<DateField source="updated_at" />
		</SimpleShowLayout>
	</Show>
);

export default showHall;
