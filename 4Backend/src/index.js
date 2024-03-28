import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env' 
});

connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;

        app.on("error", (error) => {
            console.log("Error", error);
        });

        app.listen(port, () => {
            console.log(`App listening on PORT: ${port}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err);
    });
