import userCont from '../controllers/userCont.js';
import express from 'express';
import authedUser from '../middlewares/authMdlware.js';
import path from 'path';
import multer from 'multer';
import { sendMailVerificationValidator } from '../helpers/validation.js';


const storage = multer.diskStorage({  //not used yet
    destination: function (req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, path.join(__dirname, '../public/uploads'));
        }
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ 
    storage: storage, fileFilter: fileFilter
 }).single('image');


//Route level middleware
const router = express.Router();
router.use('/changepassword', authedUser);
router.use('/loggeduser', authedUser);

//Public routes
router.post('/signup', userCont.userSignup);
router.post('/send-mail-verification', sendMailVerificationValidator, userCont.sendMailVerification);
router.post('/login', userCont.userLogin);
router.post('/forgotpassword', userCont.forgotPassword);
router.post('/reset-password/:id/:token', userCont.resetPassword);

//Private routes
router.post('/changepassword', userCont.changePassword);
router.get('/loggeduser', userCont.loggedUser);


export default router;