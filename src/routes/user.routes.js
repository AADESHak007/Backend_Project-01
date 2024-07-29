import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updatecoverImage,
  renewPassword,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../utils/cloudinary.js";

const router = Router();

const multiUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 2 },
]);

router.route("/register").post(multiUpload, registerUser);
router.route("/login").post(loginUser);

//secured routes..

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, renewPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, uploadFile.single("avatar"), updateAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, uploadFile.single("coverImage"), updatecoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
