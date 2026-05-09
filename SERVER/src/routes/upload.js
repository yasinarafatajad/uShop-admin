import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage, deleteImage } from "../controllers/upload.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.post("/deleteImage", deleteImage);

export default router;
