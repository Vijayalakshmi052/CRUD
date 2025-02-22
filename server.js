const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static("public"));

const FILE_PATH = "users.json";

// Function to read users from file
const readUsers = () => {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([])); // Initialize file if not exists
    }
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
};

// Function to write users to file
const writeUsers = (users) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
};

// Serve index.html on /
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// Read (GET) - Get all users
app.get("/api/users", (req, res) => {
    const users = readUsers();
    res.json(users);
});

// Read (GET) - Get a single user by ID
app.get("/api/users/:id", (req, res) => {
    const users = readUsers();
    const { id } = req.params;
    const user = users.find((user) => user.id === id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});

// Create (POST) - Add a new user
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    const users = readUsers();
    const newUser = { id: uuidv4(), name, email };
    users.push(newUser);
    writeUsers(users);

    res.status(201).json(newUser);
});

// Update (PUT) - Update an existing user
app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    let users = readUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    console.log("Received PUT request for ID:", id);  // Debugging
    console.log("Existing Users:", users);  // Debugging

    if (userIndex === -1) {
        console.log("User not found for update.");  // Debugging
        return res.status(404).json({ message: "User not found" });
    }

    if (!name || !email) {
        console.log("Invalid update request: Missing name or email.");  // Debugging
        return res.status(400).json({ message: "Name and email are required" });
    }

    users[userIndex] = { id, name, email };
    writeUsers(users);

    console.log("User updated successfully:", users[userIndex]);  // Debugging
    res.json(users[userIndex]);
});

// Delete (DELETE) - Remove a user
app.delete("/api/users/:id", (req, res) => {
    let users = readUsers();
    const { id } = req.params;
    const userExists = users.some((user) => user.id === id);

    if (!userExists) {
        return res.status(404).json({ message: "User not found" });
    }

    users = users.filter((user) => user.id !== id);
    writeUsers(users);

    res.json({ message: "User deleted" });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));