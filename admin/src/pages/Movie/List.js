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

const listMovie = () => (
	<List actions={<CreateOnlyTopToolbar />}>
		<Datagrid bulkActionButtons={false}>
			<TextField source="name" />
			<DateField source="created_at" />
			<DateField source="updated_at" />
			<ShowButton className="button-show" />
			<EditButton className="button-edit" />
			<DeleteButton className="button-delete" />
		</Datagrid>
	</List>
);

export default listMovie;
