import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { parse as parseCookie } from "cookie";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url!, true);

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
    });

    // Make io accessible globally for API routes (optional, but useful)
    (global as any).io = io;

    io.use((socket, next) => {
        // Authentication Middleware
        const cookies = parseCookie(socket.handshake.headers.cookie || "");
        const token = cookies.token || socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
            (socket as any).user = decoded;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        const user = (socket as any).user;
        console.log(`User connected: ${user.id}`);

        // Join user to their own room for private notifications
        socket.join(`user_${user.id}`);

        // Handle joining conversation rooms
        socket.on("join_conversation", (conversationId) => {
            // TODO: Verify user is part of conversation
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${user.id} joined conversation ${conversationId}`);
        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });

        socket.on("typing_start", (data) => {
            socket.to(`conversation_${data.conversationId}`).emit("typing_start", {
                conversationId: data.conversationId,
                userId: user.id
            });
        });

        socket.on("typing_stop", (data) => {
            socket.to(`conversation_${data.conversationId}`).emit("typing_stop", {
                conversationId: data.conversationId,
                userId: user.id
            });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${user.id}`);
        });
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
