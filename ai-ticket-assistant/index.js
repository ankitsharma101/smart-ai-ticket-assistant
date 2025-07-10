import dotenv from "dotenv";
dotenv.config({path:"./.env"});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use("/auth", userRoutes);
app.use("/tickets", ticketRoutes);

// Inngest webhook
app.use(
  "/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () =>
      console.log(`🚀 Backend running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err.message));
