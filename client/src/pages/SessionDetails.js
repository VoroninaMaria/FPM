// SessionDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const SessionDetails = () => {
	const { movieId, locationId } = useParams();
	const [sessions, setSessions] = useState([]);
	const [movieName, setMovieName] = useState("");
	const [locationName, setLocationName] = useState("");
	const [hallNames, setHallNames] = useState({});
	const [htmlResponse, setHtmlResponse] = useState("");

	useEffect(() => {
		const fetchDetails = async () => {
			try {
				const fetchGraphQL = async (query) => {
					const response = await fetch("http://localhost:5001/graphql", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ query }),
					});
					const textResult = await response.text();
					const jsonResult = JSON.parse(textResult);
					return jsonResult.data;
				};

				// Fetch sessions
				const sessionQuery = `{ allSessionByMovieAndLocation(movie_id: "${movieId}", location_id: "${locationId}") { id, day, time, movie_id, location_id, hall_id } }`;
				const sessionData = await fetchGraphQL(sessionQuery);
				const fetchedSessions = sessionData.allSessionByMovieAndLocation;
				setSessions(fetchedSessions);

				// Fetch movie name
				const movieQuery = `{ movieById(id: "${movieId}") { name } }`;
				const movieData = await fetchGraphQL(movieQuery);
				setMovieName(movieData.movieById.name);

				// Fetch location name
				const locationQuery = `{ locationById(id: "${locationId}") { name } }`;
				const locationData = await fetchGraphQL(locationQuery);
				setLocationName(locationData.locationById.name);

				// Fetch hall names
				const hallNamesMap = {};
				for (const session of fetchedSessions) {
					if (!hallNamesMap[session.hall_id]) {
						const hallQuery = `{ hallById(id: "${session.hall_id}") { name } }`;
						const hallData = await fetchGraphQL(hallQuery);
						hallNamesMap[session.hall_id] = hallData.hallById.name;
					}
				}
				setHallNames(hallNamesMap);
			} catch (error) {
				console.error("Ошибка при получении информации о деталях:", error);
			}
		};

		fetchDetails();
	}, [movieId, locationId]);

	return (
		<div>
			<h1>Session Details</h1>
			<p>
				<strong>Movie:</strong> {movieName}
			</p>
			<p>
				<strong>Location:</strong> {locationName}
			</p>
			{sessions.length > 0 ? (
				<ul>
					{sessions.map((session, index) => (
						<li key={index}>
							<p>
								<strong>Day:</strong> {session.day}
							</p>
							<p>
								<strong>Time:</strong> {session.time}
							</p>
							<p>
								<strong>Movie:</strong> {movieName}
							</p>
							<p>
								<strong>Location:</strong> {locationName}
							</p>
							<p>
								<strong>Hall:</strong> {hallNames[session.hall_id]}
							</p>
							<p>
								<strong>Details:</strong>{" "}
								<Link to={`/session/${session.id}`}>View Details</Link>
							</p>
						</li>
					))}
				</ul>
			) : (
				<p>No sessions available</p>
			)}
		</div>
	);
};

export default SessionDetails;
