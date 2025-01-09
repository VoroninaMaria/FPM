import * as React from "react";
import {
	ImageField,
	Show,
	SimpleShowLayout,
	TextField,
	ReferenceField,
	useRecordContext,
	FileField,
	Labeled,
	ReferenceArrayField,
	SingleFieldList,
	ChipField,
} from "react-admin";
import {
	DateField,
	Title,
	ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const ShowImage = () => {
	const record = useRecordContext();

	return (
		<Labeled>
			{record.mimetype === "application/pdf" ? (
				<FileField
					label="resources.File.fields.link"
					source="url"
					title="name"
					target="_blank"
				/>
			) : (
				<ImageField source="url" />
			)}
		</Labeled>
	);
};

const showMovie = () => (
	<Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
		<SimpleShowLayout>
			<TextField source="name" />
			<TextField source="description" />
			<TextField source="start_date" />
			<TextField source="age" />
			<TextField source="duration" />
			<TextField source="main_roles" />
			<TextField source="name" />
			<ReferenceArrayField source="categories_ids" reference="Category">
				<SingleFieldList linkType="show">
					<ChipField source="name" size="small" />
				</SingleFieldList>
			</ReferenceArrayField>
			<ReferenceField source="file_id" reference="File" link="show">
				<TextField source="name" />
			</ReferenceField>
			<ShowImage />
			<DateField source="created_at" />
			<DateField source="updated_at" />
		</SimpleShowLayout>
	</Show>
);

export default showMovie;
