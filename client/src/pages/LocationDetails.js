import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LocationDetails = () => {
	const { name } = useParams();
	const [location, setLocation] = useState(null);
	const [movies, setMovies] = useState([]);
	const [htmlResponse, setHtmlResponse] = useState("");

	useEffect(() => {
		const fetchLocationDetails = async () => {
			try {
				const response = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: `{ location(name: "${name}") { id, name, address } }`,
					}),
				});
				const textResult = await response.text();

				try {
					const jsonResult = JSON.parse(textResult);
					if (jsonResult.data && jsonResult.data.location) {
						setLocation(jsonResult.data.location);
						fetchMovies(jsonResult.data.location.id);
					} else {
						console.error(
							"Ошибка при получении информации о локации:",
							jsonResult.errors
						);
					}
				} catch (e) {
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error("Ошибка при получении информации о локации:", error);
			}
		};

		const fetchMovies = async (locationId) => {
			try {
				const response = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: `{ movieByLocation(location_id: "${locationId}") { category_id, file_id, name, id } }`,
					}),
				});
				const textResult = await response.text();

				try {
					const jsonResult = await JSON.parse(textResult);
					if (jsonResult.data && jsonResult.data.movieByLocation) {
						const moviesWithDetails = await Promise.all(
							jsonResult.data.movieByLocation.map(async (movie) => {
								const categoryResponse = await fetch(
									"http://localhost:5001/graphql",
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											query: `{ categoryById(id: "${movie.category_id}") { name } }`,
										}),
									}
								);
								const categoryResult = await categoryResponse.json();
								const categoryName =
									categoryResult.data?.categoryById?.name || "Unknown";

								const fileResponse = await fetch(
									"http://localhost:5001/graphql",
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											query: `{ fileById(id: "${movie.file_id}") { url } }`,
										}),
									}
								);
								const fileResult = await fileResponse.json();
								const fileUrl = fileResult.data?.fileById?.url || "";

								return {
									...movie,
									categoryName,
									fileUrl,
								};
							})
						);
						setMovies(moviesWithDetails);
					} else {
						console.error(
							"Ошибка при получении информации о фильмах:",
							jsonResult.errors
						);
					}
				} catch (e) {
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error("Ошибка при получении информации о фильмах:", error);
			}
		};

		fetchLocationDetails();
	}, [name]);

	return (
		<div>
			<h1>Location Details</h1>
			{location ? (
				<div>
					<p>
						<strong>Name:</strong> {location.name}
					</p>
					<p>
						<strong>Address:</strong> {location.address}
					</p>
				</div>
			) : (
				<p>HTML Response: {htmlResponse}</p>
			)}
			<h2>Movies</h2>
			{movies.length > 0 ? (
				<ul>
					{movies.map((movie, index) => (
						<li key={index}>
							<p>
								<strong>Category:</strong> {movie.categoryName}
							</p>
							<Link to={`/sessions/${movie.id}/${location.id}`}>
								<img src={movie.fileUrl} alt={movie.name} />
								<p>
									<strong>Name:</strong> {movie.name}
								</p>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p>No movies available</p>
			)}
		</div>
	);
};

export default LocationDetails;
