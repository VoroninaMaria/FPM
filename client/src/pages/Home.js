import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const [locations, setLocations] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState({}); // New state for background images
  const [htmlResponse, setHtmlResponse] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: "{ allLocations { name, address, file_id } }",
          }), // Updated query
        });
        const textResult = await response.text();

        try {
          const jsonResult = JSON.parse(textResult);

          if (jsonResult.data && jsonResult.data.allLocations) {
            setLocations(jsonResult.data.allLocations);

            // Fetch background images for each location
            for (const location of jsonResult.data.allLocations) {
              if (location.file_id) {
                const imageResponse = await fetch(
                  "http://localhost:5001/graphql",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      query: `{ fileById(id: "${location.file_id}") { url } }`,
                    }), // Query to fetch image URL
                  }
                );
                const imageResult = await imageResponse.json();

                setBackgroundImages((prevImages) => ({
                  ...prevImages,
                  [location.name]: imageResult.data.fileById.url,
                }));
              }
            }
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
    <div className="page-container">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item left-align">
            <a href="#" style={{ color: "#ffffff" }}>
              CinemaClub
            </a>
          </li>
          <div className="nav-right">
            <li className="nav-item">
              <a href="/">Home</a>
            </li>
            <li className="nav-item">
              <a href="/about">About Us</a>
            </li>
            <li className="nav-item">
              <a href="/contacts">Contacts</a>
            </li>
            <li className="nav-item">
              <a href="/movies">Movies</a>
            </li>
            <li className="nav-item">
              <a href="#">Location</a>
            </li>
          </div>
        </ul>
      </nav>
      <div className="content-container">
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">
              <div className="line" style={{ color: "#ffffff" }}>
                Welcome to Our{" "}
              </div>
              <div className="line" style={{ color: "#d82524" }}>
                Cinema Club
              </div>
            </h1>
            <p className="header-description">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It is a
              long established fact that a reader will be distracted by the
              readable content of a page when looking at its layout. The point
              of using Lorem Ipsum is that it has a more-or-less normal
              distribution of letters, as opposed to using 'Content here,
              content here', making it look like readable English.
            </p>
          </div>
        </header>

        <main className="main-content">
          {locations.length > 0 ? (
            <div className="location-grid">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="location-item"
                  style={{
                    backgroundImage: `url(${backgroundImages[location.name]})`, // Apply background image
                  }}
                >
                  <div className="location-address-info">
                    <Link to={`/location/${location.name}`}>
                      <strong>Address:</strong> {location.address}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>HTML Response: {htmlResponse}</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
