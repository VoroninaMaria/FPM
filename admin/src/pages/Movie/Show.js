import * as React from "react";
import {
	ImageField,
	Show,
	SimpleShowLayout,
	TextField,
	ReferenceField,
	NumberField,
	FunctionField,
	useTranslate,
	useRecordContext,
	FileField,
	Labeled,
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
			<ReferenceField source="category_id" reference="Category" link="show">
				<TextField source="name" />
			</ReferenceField>
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
