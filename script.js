const API_URL = "https://crudbackend-bay.vercel.app/api/users";

// Fetch all users and display them
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const userTable = document.getElementById("userTable");
        userTable.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" value="${user.name}" id="name-${user.id}"></td>
                <td><input type="email" value="${user.email}" id="email-${user.id}"></td>
                <td>
                    <button onclick="updateUser('${user.id}')">Update</button>
                    <button onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            userTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error fetching users. Check console for details.");
    }
}

// Add a new user
async function addUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (!name || !email) {
        alert("Both name and email are required!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });

        if (!response.ok) throw new Error("Failed to add user");

        fetchUsers();
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
    } catch (error) {
        console.error("Error adding user:", error);
        alert("Error adding user. Check console for details.");
    }
}

// Update an existing user
async function updateUser(userId) {
    const name = document.getElementById(`name-${userId}`).value;
    const email = document.getElementById(`email-${userId}`).value;

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });

        if (!response.ok) throw new Error("Failed to update user");

        fetchUsers();
    } catch (error) {
        console.error("Error updating user:", error);
        alert("Error updating user. Check console for details.");
    }
}

// Delete a user
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Failed to delete user");

        fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Check console for details.");
    }
}

// Load users when the page loads
document.addEventListener("DOMContentLoaded", fetchUsers);
