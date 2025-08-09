import { useEffect, useState } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL; 
const socket = io(backendUrl);

const EditorRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(""); // Track who is typing
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [userInput, setUserInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    // Get userName from query or localStorage
    const queryUser = new URLSearchParams(location.search).get("user");
    const storedUser = localStorage.getItem("userName");
    setUserName(queryUser || storedUser || "");

    // Fetch room name from backend (optional)
    fetch(`${backendUrl}/api/rooms/check?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.room && data.room.name) {
          setRoomName(data.room.name);
        } else {
          setRoomName(""); // fallback
        }
      });
  }, [roomId, location.search]);

  useEffect(() => {
    if (userName && userName !== "Guest" && userName.trim() !== "") {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }

    socket.on("userJoined", (users) => setUsers(users));
    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("userTyping", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));
    socket.on("codeResponse", (response) => {
      setOutPut(response?.run?.output || response?.error || "No output");
    });

    return () => {
      socket.emit("leaveRoom");
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, [roomId, userName]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", {
      code,
      roomId,
      language,
      version,
      input: userInput,
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    socket.once("leftRoom", () => {
      setJoined(false);
      setRoomName("");
      setUserName("");
      setLanguage("javascript");
      setUsers([]);
      setOutPut("");
      setUserInput("");
      setTypingUser("");
      setCopySuccess("");
      navigate("/home"); // Redirect to home page
    });
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button
            onClick={() => {
              if (userName && userName.trim() !== "") {
                socket.emit("join", { roomId, userName });
                setJoined(true);
              }
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Room Name :{roomName}</h2>
          <h2>Room ID: {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {users.filter(user => user && user !== "Guest").map((user, index) => (
            <li key={index}>
              {user.slice(0, 8)}...
              {typingUser === user && (
                <span style={{ color: "orange", marginLeft: "8px" }}>typing...</span>
              )}
            </li>
          ))}
        </ul>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height={"60vh"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
        <textarea
          className="input-console"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter input here..."
        />
        <button className="run-btn" onClick={runCode}>
          Execute
        </button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="Output will appear here ..."
        />
      </div>
    </div>
  );
};

export default EditorRoom;