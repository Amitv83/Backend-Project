import  { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { logOutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar",
            maxCount: 1 // Ensure only one avatar image is uploaded
        },
        { name: "coverImage", 
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT,  logOutUser)

export default router;