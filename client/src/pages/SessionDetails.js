import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SessionDetails = () => {
	const { movieId, locationId } = useParams();
	const [sessions, setSessions] = useState([]);
	const [htmlResponse, setHtmlResponse] = useState("");

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: `{ sessionByMovieAndLocation(movie_id: "${movieId}", location_id: "${locationId}") { day, time, movie_id, location_id, hall_id } }`,
					}),
				});
				const textResult = await response.text();

				try {
					const jsonResult = JSON.parse(textResult);
					if (jsonResult.data && jsonResult.data.sessionByMovieAndLocation) {
						setSessions(jsonResult.data.sessionByMovieAndLocation);
					} else {
						console.error(
							"Ошибка при получении информации о сессиях:",
							jsonResult.errors
						);
					}
				} catch (e) {
					setHtmlResponse(textResult);
				}
			} catch (error) {
				console.error("Ошибка при получении информации о сессиях:", error);
			}
		};

		fetchSessions();
	}, [movieId, locationId]);

	return (
		<div>
			<h1>Session Details</h1>
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
								<strong>Movie ID:</strong> {session.movie_id}
							</p>
							<p>
								<strong>Location ID:</strong> {session.location_id}
							</p>
							<p>
								<strong>Hall ID:</strong> {session.hall_id}
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
