import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/sessionDetailsPage.css";

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ phone: "", email: "" });
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [hallName, setHallName] = useState("");
  const [movieName, setMovieName] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{ sessionById(id: "${sessionId}") { time, day, location_id, hall_id, movie_id, place_arr } }`,
          }),
        });
        const textResult = await response.text();
        const jsonResult = JSON.parse(textResult);
        setSession(jsonResult.data.sessionById);

        // Fetch location name
        const locationResponse = await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{ locationById(id: "${jsonResult.data.sessionById.location_id}") { name } }`,
          }),
        });
        const locationJsonResult = await locationResponse.json();
        setLocationName(locationJsonResult.data.locationById.name);

        const hallResponse = await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{ hallById(id: "${jsonResult.data.sessionById.hall_id}") { name, min_price } }`,
          }),
        });
        const hallJsonResult = await hallResponse.json();
        setHallName(hallJsonResult.data.hallById.name);
        setMinPrice(hallJsonResult.data.hallById.min_price);

        // Fetch movie name
        const movieResponse = await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{ movieById(id: "${jsonResult.data.sessionById.movie_id}") { name } }`,
          }),
        });
        const movieJsonResult = await movieResponse.json();
        setMovieName(movieJsonResult.data.movieById.name);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    const validateForm = () => {
      let isValid = true;
      const newErrors = { phone: "", email: "" };

      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phone = "Invalid phone number";
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email address";
        isValid = false;
      }

      setErrors(newErrors);
      setIsSubmitDisabled(!isValid);
    };

    validateForm();
  }, [phone, email]);

  if (!session) {
    return <p>Loading...</p>;
  }

  const calculatePrice = (index) => {
    if (index < 8) {
      return minPrice;
    } else if (index < 16) {
      return minPrice + 2;
    } else if (index < 24) {
      return minPrice + 4;
    } else if (index < 32) {
      return minPrice + 6;
    } else if (index < 40) {
      return minPrice + 8;
    } else if (index < 48) {
      return minPrice + 6;
    } else if (index < 56) {
      return minPrice + 4;
    } else if (index < 64) {
      return minPrice + 2;
    } else {
      return minPrice;
    }
  };

  const calculateTotalPrice = () => {
    return selectedPlaces.reduce(
      (total, index) => total + calculatePrice(index),
      0
    );
  };

  const handlePlaceClick = (index) => {
    if (session.place_arr[index] !== "true") {
      setSelectedPlaces((prevSelected) =>
        prevSelected.includes(index)
          ? prevSelected.filter((i) => i !== index)
          : [...prevSelected, index]
      );
    }
  };

  const renderPlaces = () => {
    const rows = [];
    for (let i = 0; i < session.place_arr.length; i += 8) {
      const row = session.place_arr.slice(i, i + 8);
      rows.push(row);
    }
    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="places-row">
        {row.map((place, index) => {
          const actualIndex = rowIndex * 8 + index;
          const isDisabled = place === "true";
          const isSelected = selectedPlaces.includes(actualIndex);

          return (
            <button
              key={actualIndex}
              onClick={() => handlePlaceClick(actualIndex)}
              disabled={isDisabled}
              className={`place-button ${
                isDisabled ? "disabled" : isSelected ? "selected" : "available"
              }`}
            >
              {actualIndex + 1} ({calculatePrice(actualIndex)})
            </button>
          );
        })}
      </div>
    ));
  };

  const handleBuyClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isSubmitDisabled) {
      try {
        const newPlaceArr = [...session.place_arr];
        selectedPlaces.forEach((index) => {
          newPlaceArr[index] = "true";
        });
        await fetch("http://localhost:5001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `mutation {
              updateSessionPlace(
                id: "${sessionId}",
                place_arr: [${newPlaceArr
                  .map((place) => `"${place}"`)
                  .join(", ")}]
              ) {
                id
                place_arr
              }
            }`,
          }),
        });
        window.location.reload(); // Обновляем страницу после отправки формы
      } catch (error) {
        console.error("Ошибка при обновлении сессии:", error);
      }
    }
  };

  return (
    <div className="container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="session-container">
        <h1>
          {session.day} / {session.time} / {locationName} / {hallName} /{" "}
          {movieName}
        </h1>
        <div className="places-container">
          <strong>Places (numbering starts from the screen):</strong>
          {renderPlaces()}
        </div>
        {selectedPlaces.length > 0 && (
          <div>
            <p>
              <strong>Selected Places:</strong>{" "}
              {selectedPlaces.map((i) => i + 1).join(", ")}
            </p>
            <p>
              <strong>Total Price:</strong> {calculateTotalPrice()} currency
            </p>
            <button onClick={handleBuyClick} className="buy-button">
              Buy
            </button>
          </div>
        )}
        {showForm && (
          <form onSubmit={handleFormSubmit} className="session-form">
            <label>
              Phone:
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "error" : ""}
              />
            </label>
            {errors.phone && <p className="error-message">{errors.phone}</p>}
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "error" : ""}
              />
            </label>
            {errors.email && <p className="error-message">{errors.email}</p>}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`submit-button ${isSubmitDisabled ? "disabled" : ""}`}
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SessionDetailPage;
