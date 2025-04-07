import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from "./src/db/dbClient";
import AuthenticationRouter from "./src/routing/AuthenticationRouting";

const app = express();

const PORT = process.env.PORT;

app.use(cors({
  credentials: true
}));
app.use(bodyParser.json());

connectDB().then(() => {

app.use('/', AuthenticationRouter); 

app.listen(PORT, () => { 
  console.log("Server running at PORT:", PORT); 
}).on("error", (error) => { 
  throw new Error(error.message);
});
});