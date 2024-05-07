import { check } from "express-validator";

//not yet used
const signupValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Name field cannot be empty"),
    check("email")
        .isEmail()
        .normalizeEmail({
            gmail_remove_dots: true
        })
        .withMessage("Invalid email address"),
    check("password")
        .not()
        .isEmpty()
        .withMessage("Password field cannot be empty"),
];

const sendMailVerificationValidator = [
    check("email")
        .isEmail()
        .normalizeEmail({
            gmail_remove_dots: true
        })
        .withMessage("Invalid email address")
];

export { signupValidator, sendMailVerificationValidator };