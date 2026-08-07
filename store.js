const users = global.registeredUsers || Object.create(null);
global.registeredUsers = users;

function resetUsers() {
  Object.keys(users).forEach((email) => delete users[email]);
}

module.exports = { users, resetUsers };
