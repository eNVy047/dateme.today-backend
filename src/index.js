import dotenv from "dotenv";
import chalk from 'chalk';
import connectDB from "./db/index.js";
import { createApp } from "./app.js"; 

dotenv.config({
    path: './.env'
});

const { app, server } = createApp(); 

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(chalk.bgBlue(`⚙️ Server is running at port: ${process.env.PORT}`));
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
