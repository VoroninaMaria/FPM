// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import SessionDetails from "./pages/SessionDetails";
import SessionDetailPage from "./pages/SessionDetailPage"; // Import the new component

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/location/:name" element={<LocationDetails />} />
				<Route
					path="/sessions/:movieId/:locationId"
					element={<SessionDetails />}
				/>
				<Route
					path="/session/:sessionId" // Add new route for session details
					element={<SessionDetailPage />}
				/>
			</Routes>
		</Router>
	);
}

export default App;
