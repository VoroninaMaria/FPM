// src/components/Header.js
import React from "react";
import "../styles/header.css";

const Header = () => {
  return (
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
  );
};

export default Header;
