import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/sessionDetails.css"; // Ensure you have this CSS file

const SessionDetails = () => {
  const { movieId, locationId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [locationName, setLocationName] = useState("");
  const [hallNames, setHallNames] = useState({});
  const [htmlResponse, setHtmlResponse] = useState("");
  const navigate = useNavigate();

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

        // Fetch movie details
        const movieQuery = `{ movieById(id: "${movieId}") { name, description, start_date, age, duration, main_roles } }`;
        const movieData = await fetchGraphQL(movieQuery);
        setMovieDetails(movieData.movieById);

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
    <div className="container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="movie-details">
        <h2>{movieDetails.name}</h2>
        <p>
          <strong>Description:</strong> {movieDetails.description}
        </p>
        <p>
          <strong>Start Date:</strong> {movieDetails.start_date}
        </p>
        <p>
          <strong>Age:</strong> {movieDetails.age}
        </p>
        <p>
          <strong>Duration:</strong> {movieDetails.duration} min
        </p>
        <p>
          <strong>Main Roles:</strong> {movieDetails.main_roles}
        </p>
      </div>
      {sessions.length > 0 ? (
        <ul className="session-list">
          {sessions.map((session, index) => (
            <li key={index} className="session-item">
              <div className="session-info">
                <p>
                  {locationName} / {hallNames[session.hall_id]} /{" "}
                  {movieDetails.name}
                </p>
                <p>
                  Time: {session.day} / {session.time}
                </p>
              </div>
              <Link to={`/session/${session.id}`} className="session-link">
                View Details
              </Link>
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
