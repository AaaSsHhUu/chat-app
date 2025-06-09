import express from "express";
import cors, { CorsOptions } from "cors";

// Importing routes
import authRoutes from "./routes/auth"; // change the whole auth thing, make signup/signin controllers
import errorMiddleware from "./middlewares/errorMiddleware";

const app = express();

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL]

const corsOptions : CorsOptions = {
    origin : function(origin, cb){
        if(allowedOrigins.indexOf(origin) !== -1){
            cb(null, true);
        }
        else{
            cb(new Error("Not allowed by CORS"));
        }
    }
}

app.use(cors(corsOptions));
app.use(express.json());

// Registering routes
app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;