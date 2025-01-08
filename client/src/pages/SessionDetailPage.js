// SessionDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
				const locationTextResult = await locationResponse.text();
				const locationJsonResult = JSON.parse(locationTextResult);
				setLocationName(locationJsonResult.data.locationById.name);

				// Fetch hall name
				const hallResponse = await fetch("http://localhost:5001/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: `{ hallById(id: "${jsonResult.data.sessionById.hall_id}") { name } }`,
					}),
				});
				const hallTextResult = await hallResponse.text();
				const hallJsonResult = JSON.parse(hallTextResult);
				setHallName(hallJsonResult.data.hallById.name);

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
				const movieTextResult = await movieResponse.text();
				const movieJsonResult = JSON.parse(movieTextResult);
				setMovieName(movieJsonResult.data.movieById.name);
			} catch (error) {
				console.error(
					"Ошибка при получении информации о сессии, локации, зале или фильме:",
					error
				);
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
		for (let i = 0; i < session.place_arr.length; i += 5) {
			const row = session.place_arr.slice(i, i + 5);
			rows.push(row);
		}
		return rows.map((row, rowIndex) => (
			<div key={rowIndex} style={{ display: "flex", marginBottom: "10px" }}>
				{row.map((place, index) => {
					const actualIndex = rowIndex * 5 + index;
					const isDisabled = place === "true";
					const isSelected = selectedPlaces.includes(actualIndex);

					return (
						<button
							key={actualIndex}
							onClick={() => handlePlaceClick(actualIndex)}
							disabled={isDisabled}
							style={{
								width: "40px",
								height: "40px",
								margin: "5px",
								backgroundColor: isDisabled
									? "#ddd"
									: isSelected
									? "#f44336"
									: "#4caf50",
								cursor: isDisabled ? "not-allowed" : "pointer",
								color: "#fff",
								border: "none",
								borderRadius: "4px",
							}}
						>
							{actualIndex + 1}
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
				const response = await fetch("http://localhost:5001/graphql", {
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
				const textResult = await response.text();
				const jsonResult = JSON.parse(textResult);
				console.log("Updated session:", jsonResult.data.updateSessionPlace);
				// Implement further logic based on the response
			} catch (error) {
				console.error("Ошибка при обновлении сессии:", error);
			}
		}
	};

	return (
		<div>
			<h1>Session Detail</h1>
			<p>
				<strong>Day:</strong> {session.day}
			</p>
			<p>
				<strong>Time:</strong> {session.time}
			</p>
			<p>
				<strong>Location:</strong> {locationName}
			</p>
			<p>
				<strong>Hall:</strong> {hallName}
			</p>
			<p>
				<strong>Movie:</strong> {movieName}
			</p>
			<div>
				<strong>Places:</strong>
				{renderPlaces()}
			</div>
			{selectedPlaces.length > 0 && (
				<div>
					<p>
						<strong>Selected Places:</strong>{" "}
						{selectedPlaces.map((index) => index + 1).join(", ")}
					</p>
					<button
						onClick={handleBuyClick}
						style={{
							marginTop: "10px",
							padding: "10px 20px",
							backgroundColor: "#4caf50",
							color: "#fff",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Buy
					</button>
				</div>
			)}
			{showForm && (
				<form onSubmit={handleFormSubmit} style={{ marginTop: "20px" }}>
					<div>
						<label>
							Phone:
							<input
								type="text"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								required
								style={{
									marginLeft: "10px",
									padding: "5px",
									borderRadius: "4px",
									border: `1px solid ${errors.phone ? "red" : "#ddd"}`,
								}}
							/>
						</label>
						{errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}
					</div>
					<div style={{ marginTop: "10px" }}>
						<label>
							Email:
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								style={{
									marginLeft: "10px",
									padding: "5px",
									borderRadius: "4px",
									border: `1px solid ${errors.email ? "red" : "#ddd"}`,
								}}
							/>
						</label>
						{errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
					</div>
					<button
						type="submit"
						disabled={isSubmitDisabled}
						style={{
							marginTop: "20px",
							padding: "10px 20px",
							backgroundColor: "#4caf50",
							color: "#fff",
							border: "none",
							borderRadius: "4px",
							cursor: isSubmitDisabled ? "not-allowed" : "pointer",
						}}
					>
						Submit
					</button>
				</form>
			)}
		</div>
	);
};

export default SessionDetailPage;
