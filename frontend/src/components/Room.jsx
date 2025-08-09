import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const RoomSelection = () => {
  const email = localStorage.getItem("userEmail");
  const [previousRooms, setPreviousRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      const rooms = JSON.parse(localStorage.getItem(email + "_rooms") || "[]");
      setPreviousRooms(rooms);
    }
  }, [email]);

  const handleJoinPreviousRoom = (room) => {
    navigate(`/editor/${room}?user=${userName}`);
  };

  const handleCreateNewRoom = () => {
    const newRoomId = uuid();
    setRoomId(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomId && userName) {
      // Save room to history
      const rooms = JSON.parse(localStorage.getItem(email + "_rooms") || "[]");
      if (!rooms.includes(roomId)) {
        rooms.push(roomId);
        localStorage.setItem(email + "_rooms", JSON.stringify(rooms));
      }
      navigate(`/editor/${roomId}?user=${userName}`);
    }
  };

  return (
    <div className="room-selection-container">
      <h2>Welcome, {email}</h2>
      <h3>Your Previous Rooms:</h3>
      <ul>
        {previousRooms.map((room, idx) => (
          <li key={idx}>
            {room}
            <button onClick={() => handleJoinPreviousRoom(room)}>Join</button>
          </li>
        ))}
      </ul>
      <button onClick={handleCreateNewRoom}>Create New Room</button>
      <div className="join-form">
        <input
          type="text"
          placeholder="Room Id"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default RoomSelection;