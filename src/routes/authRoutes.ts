import express from "express";
import { register, login, getUserById, getAllUsers, updateUser, deleteUser } from "../controller/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/:id", getUserById);
router.get("/users", getAllUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router; // ✅ export the router that actually has routes
