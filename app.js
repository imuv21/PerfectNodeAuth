import cors from 'cors';
import connectDB from './config/connectDB.js';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

//just commenting this for production

app.use(cors());
//Database connection
connectDB(DATABASE_URL);
// JSON
app.use(express.json());
//Loading routes
app.use("/api/v1/user", userRoute);
app.use("/", authRoute);
//Listening to ports
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); //remove this for production
});