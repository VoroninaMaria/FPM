import {
	ReferenceField,
	Show,
	SimpleShowLayout,
	TextField,
	ArrayField,
	SingleFieldList,
	BooleanField,
} from "react-admin";
import {
	DateField,
	Title,
	ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
const showSession = () => (
	<Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
		<SimpleShowLayout>
			<TextField source="time" />
			<TextField source="day" />
			<ReferenceField source="location_id" reference="Location" link="show">
				<TextField source="name" />
			</ReferenceField>
			<ReferenceField source="hall_id" reference="Hall" link="show">
				<TextField source="name" />
			</ReferenceField>
			<ReferenceField source="movie_id" reference="Movie" link="show">
				<TextField source="name" />
			</ReferenceField>
			<ArrayField source="place_arr" label="Places Array">
				<SingleFieldList>
					<BooleanField source="" />
				</SingleFieldList>
			</ArrayField>
			<DateField source="created_at" />
			<DateField source="updated_at" />
		</SimpleShowLayout>
	</Show>
);

export default showSession;
