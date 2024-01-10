const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "1a2b3c",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "1a2b3c",
  }
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

const getUserById = function (id) {
  for (const user in users) {
    if (users[user].id === id) {
      return users[user];
    }
  }
  return false;
};

const emailExists = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const validateUserCredentials = function (email, password) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && bcrypt.compareSync(password, user.password)) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function (id) {     // returns an object of urls that belong to the user with id
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};



//READ

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;   // Get the user_id from the cookies
  const user = getUserById(user_id); // Get the user object from the user_id
  const password = req.body.password; // Get the password from the request body
  const templateVars = { user_id, user, password }; // Pass the user_id to the templateVars object

  if (user_id) { // If the user is registered in
    return res.redirect("/urls"); // Redirect the client to /urls
  }
  // If the user is not logged in
  res.render("register", templateVars); // Render the register template
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = getUserById(user_id);
  const password = req.body.password;
  const templateVars = { user_id, user, password };
  
  // If the user is not logged in  
  res.render("login", templateVars); // Render the login template
  
  if (user_id) { // If the user is logged in
    return res.redirect("/urls"); // Redirect the client to /urls
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;  
  const user = getUserById(user_id); 
  const templateVars = { user_id, user };
  
  if (!user_id) { // If the user is not logged in
    return res.redirect("/login"); // Redirect the client to /login
  }
  // If the user is logged in
  res.render("urls_new", templateVars); // Render the urls_new template
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;   
  const user = getUserById(user_id); 
  const urls = urlsForUser(user_id);
  const templateVars = { urls, user_id, user }; 

  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = getUserById(user_id); 
  const id = req.params.id;
  const userUrls = urlsForUser(user_id);

  if (!urlDatabase[id]) { // If the shortURL does not exist
    return res.status(404).send("Short URL does not exist"); // Send a 404 status code
  }
  if (!user_id) { // If the user is not logged in
    return res.status(401).send("Please login to view your URLs"); // Send a 401 status code
  }
  if (!userUrls[id]) { // If the user does not own the shortURL
    return res.status(403).send("You do not own this URL"); // Send a 403 status code
  }

  const longURL = urlDatabase[id].longURL; // Get the longURL from the urlDatabase
  const templateVars = { id, longURL, user_id, user };
      
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
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
    return res.status(400).send("Please enter both email and password"); // Send a 400 status code
  }

const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password using bcrypt

  if (emailExists(email)) { // If the email already exists
    return res.status(400).send("Email already exists"); // Send a 400 status code
  }
  
  const newUser = { // Create the user object using the id variable
      id,
      email,
      password: hashedPassword, // Use the hashed password
    };
  
  users[id] = newUser; // Add the new user to the users object
  res.cookie("user_id", id); // Set the user_id cookie using the id variable

  console.log(users); // Log the users object to the console
  res.redirect("/urls"); // Redirect the client to /urls
});


app.post("/login", (req, res) => {
  const email = req.body.email; // Get the email from the request body
  const password = req.body.password; // Get the password from the request body

  if (!email || !password) { // If the email or password is empty
    return res.status(403).send("Please enter both email and password"); // Send a 403 status code
  }
  
  const user = validateUserCredentials(email, password); // Validate the user credentials
    
  if (user && bcrypt.compareSync(password, user.password)) { // If the user credentials are valid && the password matches
      res.cookie("user_id", user.id); // Set the user_id cookie
      res.redirect("/urls"); // Redirect the client to /urls
    } else { // If the user credentials are invalid
      res.status(403).send("Invalid email or password"); // Send a 403 status code
    }
  });


app.post("/urls", (req, res) => {
  const id = generateRandomString(); // Generate a random string
  const longURL = req.body.longURL; // Get the longURL from the request body
  
  if (!req.cookies.user_id) { // If the user is not logged in
    return res.status(401).send("Please login to create a new URL"); // Send a 401 status code
    
  } else { // If the user is logged in
    urlDatabase[id] = { // Create the url object using the id variable
      longURL,
      userID: req.cookies.user_id,
    };
    console.log(urlDatabase); // Log the urlDatabase object to the console
    res.redirect(`/urls/${id}`);
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");    // Clear the user_id cookie
  res.status(200).redirect("/login");
});


//UPDATE

app.post("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id; // Get the user_id from the cookies
  const id = req.params.id; // Get the id from the request parameters
  const userUrls = urlsForUser(user_id); // Get the userUrls object using the user_id
  
  if (!urlDatabase[id]) { // If the shortURL does not exist
    return res.status(404).send("Short URL does not exist"); // Send a 404 status code
  }
  
  const newLongURL = req.body.longURL; // Get the newLongURL from the request body
  urlDatabase[id].longURL = newLongURL;  // update the key-value pair in the urlDatabase
  
  if (!user_id) { // If the user is not logged in
    return res.status(401).send("Please login to view and edit your URLs"); // Send a 401 status code
  }
  
  if (userUrls[id] === undefined) { // If the user does not own the shortURL
    return res.status(403).send("You do not have permission to edit this URL"); // Send a 403 status code
  }
  
  res.redirect("/urls"); // Redirect the client to /urls
});


//DELETE

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.cookies.user_id;
  const id = req.params.id; // Get the id from the request parameters
  const userUrls = urlsForUser(user_id);

  if (!urlDatabase[id]) { // If the shortURL does not exist
    return res.status(404).send("Short URL does not exist"); // Send a 404 status code
  }
  if (!user_id) { // If the user is not logged in
    return res.status(401).send("Please login to delete your URLs"); // Send a 401 status code
  }
  if (userUrls[id] === undefined) { // If the user does not own the shortURL
    return res.status(403).send("You do not have permission to delete this URL"); // Send a 403 status code
  }
   
  delete urlDatabase[id];  // Delete the key-value pair from the urlDatabase
  res.redirect("/urls"); // Redirect the client to /urls
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});