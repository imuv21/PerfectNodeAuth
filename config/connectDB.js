import mongoose from "mongoose";
const connectDB = async (DATABASE_URL) => {
    try{
        const DB_OPTIONS = {
            dbName: "UlinkDB"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("Connected successfully..."); //remove this for production
    } catch (error) {
        console.log(`Error: ${error}`); //remove this for production
    }
}
export default connectDB;