import React, { useEffect, useState } from "react";

const Home = () => {
	const [tags, setTags] = useState("");
	const [htmlResponse, setHtmlResponse] = useState("");

	useEffect(() => {
		const fetchTags = async () => {
			try {
				const response = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query: "{ allTags { name } }" }),
				});
				const textResult = await response.text();

				try {
					const jsonResult = JSON.parse(textResult);
					if (jsonResult.data && jsonResult.data.allTags) {
						const tagNames = jsonResult.data.allTags
							.map((tag) => tag.name)
							.join(", ");
						setTags(tagNames);
					} else {
						console.error("Ошибка при получении тегов:", jsonResult.errors);
					}
				} catch (e) {
					// Если не удалось распарсить как JSON, выводим как текст
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error("Ошибка при получении тегов:", error);
			}
		};

		fetchTags();
	}, []);

	return (
		<div>
			<h1>Tags</h1>
			{tags ? <p>{tags}</p> : <p>HTML Response: {htmlResponse}</p>}
		</div>
	);
};

export default Home;
