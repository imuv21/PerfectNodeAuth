import mongoose from "mongoose";
const roleOptions = ["buyer", "seller", "admin"];

//Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        enum: roleOptions,
        default: "buyer",
    },
    country: {
        type: String,
        required: true,
    }, 
    countryCode: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    countryCode2: {
        type: String,
        required: false,
    },
    whatsappNum: {
        type: String,
        required: false,
    },
    isVerified: {
        type: Number,
        default: 0,
    }
});


//Model
const userModel = mongoose.model("user", userSchema);
export default userModel