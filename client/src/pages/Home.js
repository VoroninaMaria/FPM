import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css"; // Ensure you have this CSS file

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
						console.error(jsonResult.errors);
					}
				} catch (e) {
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error(error);
			}
		};

		fetchLocations();
	}, []);

	return (
		<div className="container">
			<main className="main-content">
				<h2>Locations</h2>
				{locations.length > 0 ? (
					<ul className="location-list">
						{locations.map((location, index) => (
							<li key={index} className="location-item">
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
			</main>

			<footer className="footer">
				<p>&copy; Your Best Movies</p>
			</footer>
		</div>
	);
};

export default Home;
