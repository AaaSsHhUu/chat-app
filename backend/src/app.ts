import express from "express";
import cors, { CorsOptions } from "cors";
import errorMiddleware from "./middlewares/errorMiddleware";

// Importing routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

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
app.use("/api/v1/user", userRoutes);

app.use(errorMiddleware);

export default app;