import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LocationDetails from "./pages/LocationDetails";
import SessionDetails from "./pages/SessionDetails";
import SessionDetailPage from "./pages/SessionDetailPage"; // Импорт нового компонента
import Footer from "./components/Footer"; // Импортируем футер

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
        <Route path="/session/:sessionId" element={<SessionDetailPage />} />
      </Routes>
      <Footer /> {/* Футер будет отображаться на всех страницах */}
    </Router>
  );
}

export default App;
