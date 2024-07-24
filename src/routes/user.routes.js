import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

const multiUpload = upload.fields([{name:'avatar',maxCount:1},{name:"coverImage",maxCount:2}])

router.route("/register").post(multiUpload,registerUser);

export default router;
