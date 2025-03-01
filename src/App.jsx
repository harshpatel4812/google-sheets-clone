// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Spreadsheet from "./components/Spreadsheet.jsx";
import DataForm from "./components/DataForm.jsx";
import "./index.css";

function App() {
  return (
    <Router>
      <div>
        <nav className="navigation">
          <Link to="/" className="nav-link">Spreadsheet</Link>
          <Link to="/form" className="nav-link">Add Data</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Spreadsheet />} />
          <Route path="/form" element={<DataForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
