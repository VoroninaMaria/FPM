import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import SessionDetails from "./pages/SessionDetails";

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
			</Routes>
		</Router>
	);
}

export default App;
