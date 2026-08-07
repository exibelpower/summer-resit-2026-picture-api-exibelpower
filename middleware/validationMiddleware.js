const { users } = require("../store");

const fail = (res, message) => res.status(400).json({ status: "fail", data: { message } });
const getEmail = (req) => req.params.email || req.body.email;

function validateBodyFields(requiredFields) {
  return (req, res, next) => {
    if (!req.body || Array.isArray(req.body) || typeof req.body !== "object") {
      return fail(res, "The request body must be an object.");
    }
    const keys = Object.keys(req.body);
    const invalid = keys.length !== requiredFields.length ||
      requiredFields.some((field) => typeof req.body[field] !== "string" || req.body[field].trim() === "") ||
      keys.some((field) => !requiredFields.includes(field));
    if (invalid) return fail(res, `Expected exactly these fields: ${requiredFields.join(", ")}.`);
    next();
  };
}

function validEmailFormat(req, res, next) {
  const email = getEmail(req);
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.com$/i.test(email)) {
    return fail(res, "A valid email address ending in .com is required.");
  }
  next();
}

function emailAlreadyRegistered(req, res, next) {
  if (users[getEmail(req).toLowerCase()]) return fail(res, "The email address is already registered.");
  next();
}

function validUserEmail(req, res, next) {
  const user = users[getEmail(req).toLowerCase()];
  if (!user) return fail(res, "The email address is not registered.");
  if (!user.active) return fail(res, "The user account is inactive.");
  req.user = user;
  next();
}

module.exports = { validateBodyFields, validEmailFormat, emailAlreadyRegistered, validUserEmail };
