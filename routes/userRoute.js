import userCont from '../controllers/userCont.js';
import express from 'express';
import authedUser from '../middlewares/authMdlware.js';


//Route level middleware
const router = express.Router();
router.use('/changepassword', authedUser);


//Public routes
router.post('/signup', userCont.userSignup);
router.post('/login', userCont.userLogin);


//Private routes
router.post('/changepassword', userCont.changePassword);


export default router;