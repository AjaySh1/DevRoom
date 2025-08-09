# DevRoom

A collaborative real-time code editor built with React, Node.js, Socket.io, and MongoDB.

---

## 📁 Project Structure

```
DevRoom/
├── backend/
│   ├── index.js
│   ├── models/
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── CreateRoom.jsx
│   │   └── ...
│   ├── .env
│   ├── package.json
│   └── ...
├── README.md
└── ...
```

---

## 🚀 Features

- Real-time collaborative code editing
- Multiple language support (JavaScript, Python, Java, C++)
- Room-based collaboration (create, join, and manage rooms)
- User authentication (signup/login)
- Password hashing with **bcrypt.js**
- JWT-based authentication
- Live user presence and typing indicators
- Code execution and output console
- Persistent rooms and code history

---

## 🛠️ Tech Stack

- **Frontend:** React, Monaco Editor
- **Backend:** Node.js, Express, Socket.io, MongoDB
- **Authentication:** JWT, **bcrypt.js** (for password hashing)
- **Styling:** CSS

---

## ⚡ Getting Started

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AjaySh1/DevRoom.git
   cd DevRoom
   ```

2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```

4. **Configure environment variables:**

   - Create a `.env` file in both `backend` and `frontend` folders.
   - Example for backend:
     ```
     JWT_SECRET=your_jwt_secret
     MONGO_URI=your_mongodb_connection_string
     PORT=5000
     ```
   - Example for frontend:
     ```
     VITE_BACKEND_URL=http://localhost:5000
     ```

### Running the Project

1. **Start the backend server:**
   ```sh
   cd backend
   npm run dev
   ```

2. **Start the frontend development server:**
   ```sh
   cd ../frontend
   npm run dev
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:5173
   ```

---

## 💡 Usage

- **Signup/Login:** Create an account or log in (passwords are securely hashed with bcrypt.js).
- **Create Room:** Generate a unique room and invite others.
- **Join Room:** Enter a room ID to join an existing room.
- **Collaborate:** Edit code in real-time, see who is typing, and execute code.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---


