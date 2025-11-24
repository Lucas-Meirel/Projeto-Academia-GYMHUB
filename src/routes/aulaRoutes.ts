import express from "express";
import { registerAula } from "../controller/aulaController";

const router = express.Router();

router.post("/registerAula", registerAula);

export default router;