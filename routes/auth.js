const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/auth");
const { protect, authorize } = require("../middleware/auth");
// router.get("/", getUsers);
// router.get("/:id", getUser);

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/changepassword", protect, changePassword);

module.exports = router;
