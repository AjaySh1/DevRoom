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
  const [typingUser, setTypingUser] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [userInput, setUserInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  // DevAi Chat states
  const [devAiOpen, setDevAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // DevAi panel resize states
  const [devAiWidth, setDevAiWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const queryUser = new URLSearchParams(location.search).get("user");
    const storedUser = localStorage.getItem("userName");
    setUserName(queryUser || storedUser || "");

    fetch(`${backendUrl}/api/rooms/check?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.room && data.room.name) {
          setRoomName(data.room.name);
        } else {
          setRoomName("");
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

  // DevAi panel resize handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setDevAiWidth(Math.max(250, Math.min(newWidth, 600)));
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
      navigate("/home");
    });
  };

  // DevAi Chat functions
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatHistory([...chatHistory, { sender: "user", text: chatInput }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/devai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: "ai", text: data.response || "No response" }]);
    } catch {
      setChatHistory(prev => [...prev, { sender: "ai", text: "Error: Could not get response." }]);
    }
    setChatInput("");
    setChatLoading(false);
  };

  // Copy code block handler
  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
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
                <span className="typing-indicator">typing...</span>
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
        <button
          className="devai-btn"
          onClick={() => setDevAiOpen(!devAiOpen)}
        >
          {devAiOpen ? "Close DevAi" : "Ask DevAi"}
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

      {devAiOpen && (
        <div
          className="devai-panel"
          style={{
            width: devAiWidth,
            minWidth: 250,
            maxWidth: 600,
          }}
        >
          <div
            className="devai-resizer"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />
          <h3 className="devai-title">DevAi Chat</h3>
          <div className="devai-chat-history">
            {chatHistory.map((msg, idx) => {
              // Remove Markdown bold (**text**) and italics (*text*)
              const cleanText = msg.text
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1');   // Remove italics

              if (msg.sender === "ai" && cleanText.includes("```")) {
                const parts = cleanText.split("```");
                const codeBlock = parts[1].replace(/c\+\+|cpp|python|javascript|java/g, "").trim();
                return (
                  <div key={idx} className="devai-ai-msg">
                    {parts[0] && <div>{parts[0].trim()}</div>}
                    <div className="devai-code-block-wrapper">
                      <button
                        className="devai-copy-btn"
                        onClick={() => handleCopyCode(codeBlock, idx)}
                      >
                        {copiedIdx === idx ? "Copied!" : "Copy"}
                      </button>
                      <pre className="devai-code-block">{codeBlock}</pre>
                    </div>
                    {parts[2] && <div>{parts[2].trim()}</div>}
                  </div>
                );
              }
              return (
                <div key={idx} className={msg.sender === "user" ? "devai-user-msg" : "devai-ai-msg"}>
                  {cleanText}
                </div>
              );
            })}
            {chatLoading && (
              <div className="devai-typing">DevAi is typing...</div>
            )}
          </div>
          <div className="devai-chat-input-row">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask DevAi for help..."
              className="devai-chat-input"
              onKeyDown={e => {
                if (e.key === "Enter") sendMessage();
              }}
              disabled={chatLoading}
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="devai-send-btn"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorRoom;
