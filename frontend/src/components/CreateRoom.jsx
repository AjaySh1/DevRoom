import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const CreateRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName"); // <-- Get user name
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleGenerateId = () => {
    setRoomId(uuidv4());
  };

  const handleCreateRoom = async () => {
    setError("");
    if (!roomId || !roomName) {
      setError("Room ID and Name are required.");
      return;
    }
    // Check if room already exists
    const checkRes = await fetch(`${backendUrl}/api/rooms/check?roomId=${roomId}`);
    const checkData = await checkRes.json();
    if (checkData.exists) {
      setError("Room ID already booked. Please choose another.");
      return;
    }
    // Create room
    const createRes = await fetch(`${backendUrl}/api/rooms/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, name: roomName, createdBy: email }),
    });
    const createData = await createRes.json();
    if (createRes.ok) {
      // Pass userName in the URL so Editor.jsx can use it
      navigate(`/editor/${roomId}?user=${encodeURIComponent(userName)}`);
    } else {
      setError(createData.error || "Failed to create room.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create New Room</h2>
        <input
          type="text"
          placeholder="Room ID (unique)"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />
        <button onClick={handleGenerateId} style={{ marginBottom: "1rem" }}>
          Generate Unique ID
        </button>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>
    </div>
  );
};

export default CreateRoom;