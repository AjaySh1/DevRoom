import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const Home = () => {
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const [previousRooms, setPreviousRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState(name || "");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL; 

  useEffect(() => {
    if (email) {
      fetch(`${backendUrl}/api/rooms?email=${email}`)
        .then(res => res.json())
        .then(data => setPreviousRooms(data.rooms || []));
    }
  }, [email]);

  const joinRoomInDB = async (room) => {
    await fetch(`${backendUrl}/api/rooms/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, roomId: room }),
    });
  };

  const handleJoinPreviousRoom = async (room) => {
    if (userName) {
      await joinRoomInDB(room);
      navigate(`/editor/${room}?user=${userName}`);
    }
  };

  const handleCreateNewRoom = () => {
    navigate("/create-room");
  };

  const handleJoinRoom = async () => {
    if (roomId && userName) {
      await joinRoomInDB(roomId);
      navigate(`/editor/${roomId}?user=${userName}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h2>Welcome, {name ? name : email}</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          className="home-input"
        />
        <h3>Your Previous Rooms:</h3>
        <ul className="room-list">
          {previousRooms.length === 0 && <li>No rooms yet.</li>}
          {previousRooms.map((room, idx) => (
            <li key={idx} className="room-item">
              <span className="room-id">
                <strong>{room.name}</strong> <br />
                <small>ID: {room.roomId}</small>
              </span>
              <button
                className="room-join-btn"
                onClick={() => handleJoinPreviousRoom(room.roomId)}
                disabled={!userName}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
        <div className="join-form">
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="home-input"
          />
          <button className="room-join-btn" onClick={handleJoinRoom} disabled={!roomId || !userName}>
            Join Room
          </button>
        </div>
        <div className="final">
        <button className="room-create-btn" onClick={handleCreateNewRoom}>Create New Room</button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
