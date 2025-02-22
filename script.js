const API_URL = "https://crudbackend-bay.vercel.app/api/users";

// Fetch all users and display them
async function fetchUsers() {
    const response = await fetch(API_URL);
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
}

// Add a new user
async function addUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (!name || !email) {
        alert("Both name and email are required!");
        return;
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    });

    if (response.ok) {
        fetchUsers();
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
    } else {
        alert("Error adding user!");
    }
}

// Update an existing user
async function updateUser(userId) {
    const name = document.getElementById(`name-${userId}`).value;
    const email = document.getElementById(`email-${userId}`).value;

    const response = await fetch(`${API_URL}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    });

    if (response.ok) {
        fetchUsers();
    } else {
        alert("Error updating user!");
    }
}

// Delete a user
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const response = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE"
    });

    if (response.ok) {
        fetchUsers();
    } else {
        alert("Error deleting user!");
    }
}

// Load users when the page loads
document.addEventListener("DOMContentLoaded", fetchUsers);
