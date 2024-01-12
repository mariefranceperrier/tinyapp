import express from 'express'
import cookieSession from 'cookie-session'
import bcrypt from 'bcryptjs'
import { users, urlDatabase } from "./userData.js";
import { generateRandomString, getUserByEmail, getUserById, urlsForUser } from './helpers.js'

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: "session",   // name of the cookie
  keys: ["sHekHinaH"], // secret keys used to encrypt the cookie
  maxAge: 24 * 60 * 60 *1000 // 24 hours
}));


const validateUserCredentials = function (email, password) {
  const user = getUserByEmail(email, users);
    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
  return null;
};


//READ

app.get("/", (req, res) => {
  const user_id = req.session.user_id; 

  if (user_id) { // If the user is logged in
    return res.redirect("/urls"); // Redirect the client to /urls
  }

  if (!user_id) { // If the user is not logged in
    return res.redirect("/login"); // Redirect the client to /login
  }
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;   // Get the user_id from the cookies
  const user = getUserById(user_id); // Get the user object from the user_id
  const templateVars = { user_id, user }; // Pass the user_id to the templateVars object

  if (user_id) { // If the user is registered in
    return res.redirect("/urls"); // Redirect the client to /urls
  }
  // If the user is not logged in
  res.render("register", templateVars); // Render the register template
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = getUserById(user_id);
  const templateVars = { user_id, user };
  
  if (user_id) { // If the user is logged in
    return res.redirect("/urls"); // Redirect the client to /urls
  }
  // If the user is not logged in
  res.render("login", templateVars); //  Render the login template 
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;  
  const user = getUserById(user_id); 
  const templateVars = { user_id, user };
  
  if (!user_id) { // If the user is not logged in
  return res.status(401).send("Please login to create a new URL"); // Send a 401 status code
  }
  
  // If the user is logged in
  res.render("urls_new", templateVars); // Render the urls_new template
  
});


app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;   
  const user = getUserById(user_id); 
  const urls = urlsForUser(user_id);
  const templateVars = { urls, user_id, user }; 
  
  if (!user_id) { // If the user is not logged in
    return res.status(401).send("Please login to view your URLs"); // Send a 401 status code 
  }
  res.render("urls_index", templateVars);

});


app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
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
  const id = req.params.id;
  
  if (urlDatabase[id]) { // If the shortURL exists
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else { // If the shortURL does not exist}
    return res.status(404).send("URL does not exist"); // Send a 404 status code
  }
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

  const existingUser = getUserByEmail(email, users); 
  if (existingUser) { // If the email already exists (if returned user is not undefined)
    return res.status(400).send("Email already exists"); // Send a 400 status code
  }
  
  const saltRound = 10; 
  const salt = bcrypt.genSaltSync(saltRound); // Generate a salt using bcrypt
  const hashedPassword = bcrypt.hashSync(password, salt); // Hash the password using bcrypt

  const newUser = { // Create the user object using the id variable
      id,
      email,
      password: hashedPassword, // Use the hashed password
    };
  
  users[id] = newUser; // Add the new user to the users object
  req.session.user_id = id; // Set the user_id cookie using the id variable

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
      req.session.user_id = user.id; // Set the user_id cookie
      res.redirect("/urls"); // Redirect the client to /urls
    } else { // If the user credentials are invalid
      res.status(403).send("Invalid email or password"); // Send a 403 status code
    }
  });


app.post("/urls", (req, res) => {
  const id = generateRandomString(); // Generate a random string
  const longURL = req.body.longURL; // Get the longURL from the request body
  
  if (!req.session.user_id) { // If the user is not logged in
    return res.status(401).send("Please login to create a new URL"); // Send a 401 status code
    
  } else { // If the user is logged in
    urlDatabase[id] = { // Create the url object using the id variable
      longURL,
      userID: req.session.user_id, 
    };
    console.log(urlDatabase); // Log the urlDatabase object to the console
    res.redirect(`/urls/${id}`);
  }
});


app.post("/logout", (req, res) => {
  req.session = null;    // Clear the user_id cookie
  res.status(200).redirect("/login");
});


//UPDATE

app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id; // Get the user_id from the cookies
  const id = req.params.id; // Get the id from the request parameters
  const userUrls = urlsForUser(user_id); // Get the userUrls object using the user_id
  
  if (!urlDatabase[id]) { // If the shortURL does not exist
    return res.status(404).send("Short URL does not exist"); // Send a 404 status code
  }
  if (!user_id) { // If the user is not logged in
    return res.status(401).send("Please login to view and edit your URLs"); // Send a 401 status code
  }
  if (userUrls[id] === undefined) { // If the user does not own the shortURL
    return res.status(403).send("You do not have permission to edit this URL"); // Send a 403 status code
  }

  // If the user is logged in and owns the shortURL
  const newLongURL = req.body.longURL; // Get the newLongURL from the request body
  urlDatabase[id].longURL = newLongURL;  // update the key-value pair in the urlDatabase
  res.redirect("/urls"); // Redirect the client to /urls
});


//DELETE

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
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
  
  // If the user is logged in and owns the shortURL
  delete urlDatabase[id];  // Delete the key-value pair from the urlDatabase
  res.redirect("/urls"); // Redirect the client to /urls
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});