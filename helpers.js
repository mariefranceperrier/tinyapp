export const users = {
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

export const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "1a2b3c",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "1a2b3c",
  }
};

export const getUserByEmail = function (email, users) {

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined; // If no user with that email is found, return undefined
};

export const getUserById = function (id) {
  for (const user in users) {
    if (users[user].id === id) {
      return users[user];
    }
  }
  return false;
};

export const urlsForUser = function (id) {     // returns an object of urls that belong to the user with id
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};