import cors from 'cors';
import connectDB from './config/connectDB.js';
import userRoute from './routes/userRoute.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();

const port =  process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

app.use(cors());
//Database connection
connectDB(DATABASE_URL);
// JSON
app.use(express.json());
//Loading routes
app.use("/api/v1/user", userRoute);
//Listening to ports
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); //remove this for production
})