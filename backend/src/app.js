import express from "express";
import converterRouter from "./routes/converter.route.js";
const app = express();

app.use(express.json());

app.use("/api/v1", converterRouter)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Something went wrong!"
    });
});

export default app;