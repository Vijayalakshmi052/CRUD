require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// Configure CORS
const corsOptions = {
    origin: ["https://crudbackend-bay.vercel.app"], // Your frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 },
    name: String,
    email: String
});
const User = mongoose.model("User", userSchema);

// Serve User Management UI
app.get("/", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>CRUD Application</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    h1 { color: darkblue; }
                    form { margin: 20px auto; width: 300px; }
                    input, button { width: 100%; padding: 8px; margin: 5px 0; }
                    table { width: 50%; margin: 20px auto; border-collapse: collapse; }
                    th, td { padding: 10px; border: 1px solid black; }
                    th { background-color: lightblue; }
                </style>
            </head>
            <body>
                <h1>User Management</h1>
                <form id="userForm">
                    <input type="text" id="name" placeholder="Enter name" required>
                    <input type="email" id="email" placeholder="Enter email" required>
                    <input type="hidden" id="userId">
                    <button type="submit" id="submitButton">Add User</button>
                </form>
                <h2>Users List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTable"></tbody>
                </table>
                <script>
                    async function fetchUsers() {
                        const res = await fetch('/api/users');
                        const users = await res.json();
                        const table = document.getElementById('userTable');
                        table.innerHTML = users.map(user => 
                            \`<tr>
                                <td>\${user.name}</td>
                                <td>\${user.email}</td>
                                <td>
                                    <button onclick="editUser('\${user.id}', '\${user.name}', '\${user.email}')">Edit</button>
                                    <button onclick="deleteUser('\${user.id}')">Delete</button>
                                </td>
                            </tr>\`
                        ).join('');
                    }

                    document.getElementById('userForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const name = document.getElementById('name').value;
                        const email = document.getElementById('email').value;
                        const userId = document.getElementById('userId').value;

                        if (userId) {
                            // Update user
                            await fetch(\`/api/users/\${userId}\`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, email })
                            });
                        } else {
                            // Add new user
                            await fetch('/api/users', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, email })
                            });
                        }

                        document.getElementById('userForm').reset();
                        document.getElementById('userId').value = '';
                        document.getElementById('submitButton').innerText = 'Add User';
                        fetchUsers();
                    });

                    function editUser(id, name, email) {
                        document.getElementById('name').value = name;
                        document.getElementById('email').value = email;
                        document.getElementById('userId').value = id;
                        document.getElementById('submitButton').innerText = 'Update User';
                    }

                    async function deleteUser(id) {
                        await fetch(\`/api/users/\${id}\`, { method: 'DELETE' });
                        fetchUsers();
                    }

                    fetchUsers();
                </script>
            </body>
        </html>
    `);
});

// GET all users
app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// POST - Create a new user
app.post("/api/users", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
});

// PUT - Update a user
app.put("/api/users/:id", async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findOneAndUpdate(
        { id: req.params.id },
        { name, email },
        { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

// DELETE - Remove a user
app.delete("/api/users/:id", async (req, res) => {
    const user = await User.findOneAndDelete({ id: req.params.id });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
});

// Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
