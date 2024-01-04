const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function () {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {  
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const emailExists = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}


//READ

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/register", (req, res) => {
  res.render("register");
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user;   // Get the user_id from the cookies
  const templateVars = { user_id };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user;   // Get the user_id from the cookies
  const templateVars = { urls: urlDatabase, user_id }; // Pass the user_id to the templateVars object
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user;
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id, longURL, user_id };
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

app.post("/register", (req, res) => {
  const id = generateRandomString(); // Generate a random string
  const email = req.body.email; // Get the email from the request body
  const password = req.body.password; // Get the password from the request body

  if (!email || !password) { // If the email or password is empty
    res.status(400).send("Please enter an email and password"); // Send a 400 status code
  } else if (emailExists(email)) { // If the email already exists
    res.status(400).send("Email already exists"); // Send a 400 status code
  } else {
    users[id] = { // Add the new key-value pair to the users object
    id,
    email,
    password,
    };
  }
  res.cookie("user_id", id); // Set the user_id cookie

  console.log(users); // Log the users object to the console
  res.redirect("/urls"); // Redirect the client to /urls
});


// what to do with this login post request?//
app.post("/login", (req, res) => {
  const email = req.body.email; // Get the email from the request body
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(); // Generate a random string
  const longURL = req.body.longURL; // Get the longURL from the request body
  
  urlDatabase[id] = longURL; // Add the new key-value pair to the urlDatabase
  res.redirect(`/urls/${id}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");    // Clear the user_id cookie
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