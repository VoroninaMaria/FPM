import React from "react";
import "../styles/header.css";

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        {" "}
        <ul className="nav-list">
          {" "}
          <li className="nav-item left-align">
            {" "}
            <a href="#" style={{ color: "#ff2079" }}>
              CinemaClub
            </a>{" "}
          </li>{" "}
          <div className="nav-right">
            {" "}
            <li className="nav-item">
              {" "}
              <a href="/">Home</a>{" "}
            </li>{" "}
            <li className="nav-item">
              {" "}
              <a href="/about">About Us</a>{" "}
            </li>{" "}
            <li className="nav-item">
              {" "}
              <a href="/contacts">Contacts</a>{" "}
            </li>{" "}
            <li className="nav-item">
              {" "}
              <a href="/movies">Movies</a>{" "}
            </li>{" "}
            <li className="nav-item">
              {" "}
              <a href="#">Location</a>{" "}
            </li>{" "}
          </div>{" "}
        </ul>{" "}
      </nav>
      <div className="header-content">
        <h1 className="header-title">
          <div style={{ color: "#ffffff" }}>Welcome to Our </div>
          <div style={{ color: "#ff2079" }}>Cinema Club</div>
        </h1>
        <p className="header-description">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It is a long established fact that a
          reader will be distracted by the readable content of a page when
          looking at its layout. The point of using Lorem Ipsum is that it has a
          more-or-less normal distribution of letters, as opposed to using
          'Content here, content here', making it look like readable English.
          Many desktop publishing packages and web page editors now use Lorem
          Ipsum as their default model text, and a search for 'lorem ipsum' will
          uncover many web sites still in their infancy. Various versions have
          evolved over the years, sometimes by accident,
        </p>
      </div>
    </header>
  );
}

export default Header;
