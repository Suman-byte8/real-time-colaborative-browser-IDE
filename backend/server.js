import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const YSocketIO = new YSocketIO(io);
YSocketIO.initialize();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World",
    succes: true,
  });
});

httpServer.listen(3000, () => {
  console.log("Server is Running on port 3000");
});
