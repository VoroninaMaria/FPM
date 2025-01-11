import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/locationDetails.css";

const LocationDetails = () => {
  const { name } = useParams();
  const [location, setLocation] = useState(null);
  const [movies, setMovies] = useState([]);
  const [htmlResponse, setHtmlResponse] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // New state for category filter
  const navigate = useNavigate();

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
            fetchMovies(jsonResult.data.location.id, categoryFilter); // Include filter in the fetchMovies call
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

    fetchLocationDetails();
  }, [name]);

  useEffect(() => {
    if (location) {
      fetchMovies(location.id, categoryFilter);
    }
  }, [categoryFilter, location]);

  const fetchMovies = async (locationId, category_name) => {
    try {
      const response = await fetch("http://localhost:5001/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{ movieByLocation(location_id: "${locationId}", category_name: "${category_name}") { categories_ids, file_id, name, description, start_date, age, duration, main_roles, id } }`,
        }),
      });
      const textResult = await response.text();

      try {
        const jsonResult = await JSON.parse(textResult);

        if (jsonResult.data && jsonResult.data.movieByLocation) {
          const moviesWithDetails = await Promise.all(
            jsonResult.data.movieByLocation.map(async (movie) => {
              const categoriesResponses = await Promise.all(
                movie.categories_ids.map(async (category_id) => {
                  const categoryResponse = await fetch(
                    "http://localhost:5001/graphql",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        query: `{ categoryById(id: "${category_id}") { name } }`,
                      }),
                    }
                  );

                  const categoryResult = await categoryResponse.json();

                  return categoryResult.data?.categoryById?.name || "Unknown";
                })
              );

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
                categoriesNames: categoriesResponses,
                fileUrl,
              };
            })
          );

          setMovies(moviesWithDetails);
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

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  return (
    <div className="container">
      <div className="location-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
        {location ? (
          <div className="location-info">
            <p>
              {location.name} / {location.address}
            </p>
          </div>
        ) : (
          <p>HTML Response: {htmlResponse}</p>
        )}
      </div>
      <div className="filter-container">
        <label htmlFor="categoryFilter">Filter by Category:</label>
        <select
          id="categoryFilter"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          <option value="">All</option>
          <option value="businki">businki</option>
          <option value="Category2">Category2</option>
          {/* Add more categories as needed */}
        </select>
      </div>
      {movies.length > 0 ? (
        <ul className="movie-list">
          {movies.map((movie, index) => (
            <li key={index} className="movie-item">
              <img
                src={movie.fileUrl}
                alt={movie.name}
                className="movie-image"
              />
              <div className="movie-info">
                <p>
                  <strong>{movie.name}</strong>
                </p>
                <p>Since {movie.start_date}</p>
                <p>
                  {movie.categoriesNames.join(", ")} / {movie.age} /{" "}
                  {movie.duration} min
                </p>
                <p>Main Roles: {movie.main_roles}</p>
                <p>{movie.description}</p>
                <Link to={`/sessions/${movie.id}/${location.id}`}>
                  <p>More Info</p>
                </Link>
              </div>
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
