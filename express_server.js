const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function () {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


//READ

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/register", (req, res) => {
  const username = req.cookies.username;   // Get the username from the cookies
  const templateVars = { username };
  res.render("register", templateVars);
});


app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;   // Get the username from the cookies
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username ;   // Get the username from the cookies
  const templateVars = { urls: urlDatabase, username }; // Pass the username to the templateVars object
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//CREATE

app.post("/login", (req, res) => {
  const username = req.body.username; // Get the username from the request body
  res.cookie("username", username); // Set the username cookie
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(); // Generate a random string
  const longURL = req.body.longURL; // Get the longURL from the request body
  
  urlDatabase[id] = longURL; // Add the new key-value pair to the urlDatabase
  res.redirect(`/urls/${id}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");    // Clear the username cookie
  res.redirect("/urls");
});


//UPDATE

app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the id from the request parameters
  const longURL = urlDatabase[req.params.id]; // Get the longURL from the urlDatabase
  const newLongURL = req.body.longURL; // Get the newLongURL from the request body
  urlDatabase[id] = newLongURL;  // update the key-value pair in the urlDatabase

  res.redirect("/urls"); // Redirect the client to /urls
});



//DELETE

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // Get the id from the request parameters
  delete urlDatabase[id];  // Delete the key-value pair from the urlDatabase
  res.redirect("/urls"); // Redirect the client to /urls
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});