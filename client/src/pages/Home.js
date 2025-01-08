import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
	const [locations, setLocations] = useState([]);
	const [htmlResponse, setHtmlResponse] = useState("");

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query: "{ allLocations { name, address } }" }),
				});
				const textResult = await response.text();

				try {
					const jsonResult = JSON.parse(textResult);
					if (jsonResult.data && jsonResult.data.allLocations) {
						setLocations(jsonResult.data.allLocations);
					} else {
						console.error("Ошибка при получении локаций:", jsonResult.errors);
					}
				} catch (e) {
					// Если не удалось распарсить как JSON, выводим как текст
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error("Ошибка при получении локаций:", error);
			}
		};

		fetchLocations();
	}, []);

	return (
		<div>
			<h1>Locations</h1>
			{locations.length > 0 ? (
				<ul>
					{locations.map((location, index) => (
						<li key={index}>
							<Link to={`/location/${location.name}`}>
								<strong>Name:</strong> {location.name} <br />
								<strong>Address:</strong> {location.address}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p>HTML Response: {htmlResponse}</p>
			)}
		</div>
	);
};

export default Home;
