import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import EditorRoom from "./components/Editor";
import CreateRoom from "./components/CreateRoom"; // <-- Import your new component

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/home" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorRoom />} />
      </Routes>
    </Router>
  );
}

export default App;