const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "users.txt");

// Function to read usersdata
function readUsers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return data ? JSON.parse(data) : [];
}

// Function to write users  data
function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

//function to create the server
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Home Route
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Welcome to the User Management System!");
    //Add-user Route
  } else if (req.method === "POST" && req.url === "/add-user") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const user = JSON.parse(body);
        if (!user.firstName || !user.lastName) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ error: "First Name and Last Name are required" })
          );
        }
        //To check weather the users exists or not
        let users = readUsers();
        if (
          users.some(
            (u) =>
              u.firstName === user.firstName && u.lastName === user.lastName
          )
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "User already exists" }));
        }

        users.push(user);
        writeUsers(users);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User added successfully" }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request data" }));
      }
    });
    //To show the users list
  } else if (req.method === "GET" && req.url === "/users") {
    try {
      let users = readUsers();
      if (users.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "No users found. Please add users first." })
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  } else {
    // To handle invalid  routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});
//to run the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
