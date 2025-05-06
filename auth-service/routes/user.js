const { getAllUsers, deleteUser } = require("../controllers/userController");
const { verifyToken, verifyTokenOnlyAdmin } = require("../middlewares/VerifyToken");

const router = require("express").Router();

// GET ALL USERS
router.get("/", verifyToken, getAllUsers);

// DELETE USER
router.delete("/:id", verifyTokenOnlyAdmin, deleteUser);
module.exports = router;