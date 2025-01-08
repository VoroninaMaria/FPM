import {
	Datagrid,
	List,
	ReferenceField,
	TextField,
	ShowButton,
	EditButton,
} from "react-admin";
import {
	DateField,
	DeleteButton,
	CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listSession = () => (
	<List actions={<CreateOnlyTopToolbar />}>
		<Datagrid bulkActionButtons={false}>
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
			<DateField source="created_at" />
			<DateField source="updated_at" />
			<ShowButton className="button-show" />
			<EditButton className="button-edit" />
			<DeleteButton className="button-delete" />
		</Datagrid>
	</List>
);

export default listSession;
