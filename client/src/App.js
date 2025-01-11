// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import SessionDetails from "./pages/SessionDetails";
import SessionDetailPage from "./pages/SessionDetailPage";
import Footer from "./components/Footer";
import Header from "./components/Header"; // Import the Header component

function App() {
  return (
    <Router>
      <Header /> {/* Header will be displayed on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/location/:name" element={<LocationDetails />} />
        <Route
          path="/sessions/:movieId/:locationId"
          element={<SessionDetails />}
        />
        <Route path="/session/:sessionId" element={<SessionDetailPage />} />
      </Routes>
      <Footer /> {/* Footer will be displayed on all pages */}
    </Router>
  );
}

export default App;
