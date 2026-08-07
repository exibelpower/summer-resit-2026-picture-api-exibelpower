const crypto = require("crypto");
const path = require("path");
const express = require("express");
const multer = require("multer");
const { users } = require("../store");
const { validateBodyFields, validEmailFormat, emailAlreadyRegistered, validUserEmail } = require("../middleware/validationMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 1, fileSize: 10 * 1024 * 1024 } });
const success = (res, code, data) => res.status(code).json({ status: "success", data });
const fail = (res, message) => res.status(400).json({ status: "fail", data: { message } });
const pictureEntries = (user) => Object.entries(user).filter(([key]) => /^pic\d+$/.test(key));
const pictureKey = (value) => /^pic\d+$/.test(value) ? value : /^\d+$/.test(value) ? `pic${value}` : null;

router.post("/register", validateBodyFields(["email", "firstname", "lastname"]), validEmailFormat, emailAlreadyRegistered, (req, res) => {
  const email = req.body.email.toLowerCase();
  users[email] = { email, firstname: req.body.firstname, lastname: req.body.lastname, active: true, pic_count: 0 };
  return success(res, 201, { user: users[email] });
});

router.get("/", (req, res) => success(res, 200, {
  users: Object.values(users).map(({ firstname, lastname, active }) => ({ firstname, lastname, active }))
}));

router.put("/", validateBodyFields(["email"]), validEmailFormat, validUserEmail, (req, res) => {
  req.user.active = true;
  return success(res, 200, { user: req.user });
});

router.delete("/", validateBodyFields(["email"]), validEmailFormat, validUserEmail, (req, res) => {
  req.user.active = false;
  return success(res, 200, { user: req.user });
});

router.post("/pictures/:email", validEmailFormat, validUserEmail, upload.single("picture"), (req, res) => {
  if (!req.file) return fail(res, "Upload one file using the 'picture' field.");
  const extension = path.extname(req.file.originalname).toLowerCase();
  if (!extension) return fail(res, "The uploaded file must have an extension.");
  let filename;
  do filename = `${crypto.randomInt(1000000000, 10000000000)}${extension}`;
  while (pictureEntries(req.user).some(([, picture]) => picture.filename === filename));

  const key = `pic${req.user.pic_count}`;
  req.user[key] = { filename, description: "", file_extention: extension, visible: true, size: req.file.size };
  req.user.pic_count += 1;
  return success(res, 201, { pic: key, picture: req.user[key] });
});

router.get("/pictures/visible/:email", validEmailFormat, validUserEmail, (req, res) => success(res, 200, {
  pictures: Object.fromEntries(pictureEntries(req.user).filter(([, picture]) => picture.visible))
}));

router.get("/pictures/:email", validEmailFormat, validUserEmail, (req, res) => success(res, 200, {
  pictures: Object.fromEntries(pictureEntries(req.user))
}));

router.put("/pictures/visible/:visible", validateBodyFields(["email", "pic"]), validEmailFormat, validUserEmail, (req, res) => {
  if (!/^(true|false)$/i.test(req.params.visible)) return fail(res, "The visible parameter must be true or false.");
  const key = pictureKey(req.body.pic);
  if (!key || !req.user[key]) return fail(res, "The requested picture does not exist.");
  req.user[key].visible = req.params.visible.toLowerCase() === "true";
  return success(res, 200, { pic: key, picture: req.user[key] });
});

router.put("/pictures", validateBodyFields(["email", "pic", "description"]), validEmailFormat, validUserEmail, (req, res) => {
  const key = pictureKey(req.body.pic);
  if (!key || !req.user[key]) return fail(res, "The requested picture does not exist.");
  req.user[key].description = req.body.description;
  return success(res, 200, { pic: key, picture: req.user[key] });
});

module.exports = router;
