/// --- SERVER.JS ---

const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const chatRouter = require("./routes/chatRoutes");
const fs = require("fs");
const { v4: uuid } = require("uuid");
//server is a class on socket.io
const { Server } = require("socket.io");
require("dotenv").config();
app.use(cors());

const readData = () => {
	const usersData = fs.readFileSync("./data/users.json");
	return JSON.parse(usersData);
};

const writeData = (usersData) => {
	// JSON.stringify takes additional parameters, that allow us to specify the amounts of white space (ie, indentation) in the file
	fs.writeFileSync("./data/users.json", JSON.stringify(usersData, null, 2));
};

// -- SOCKETS -- //

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		// origin is  CLIENT_URL
		// origin: "http://localhost:3000"
		// can specify methods here
		// methods: ["GET", "POST"]
	}
});

// listening for event "connection" in socket server
io.on("connection", (socket) => {
	console.log(`User connected ${socket.id}`);
	// console.log("socket", socket);

	//create event listener
	//listen for event("join_room") on client side
	//pass data back to client side, will be receiving room id
	socket.on("join_room", (data) => {
		socket.join(data);
		console.log(`user with id ${socket.id} joined room ${data}`);
	});

	//listening for event send_message, receive messageData object
	socket.on("send_message", (data) => {
		//send received messageData back to frontend, to "receive message"
		//send only to the room, to all other users who are listening in the same room
		socket.to(data.room).emit("receive_message", data);
		console.log("data", data.authorID);

		//write messages to json
		const users = readData();

		const author = users.find((user) => {
			console.log(user.id === data.authorID);
			return user.id === data.authorID;
		});

		author.messages.push(data);

		const receiver = users.find((user) => {
			console.log(user.id === data.receivedByID);
			return user.id === data.receivedByID;
		});

		receiver.messages.push(data);

		writeData(users);

		console.log("author", author);
	});

	//listen for event "disconnent" when user disconnects from server
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
	});
});

//listening on SERVER_URL (socket)
server.listen(process.env.SOCKET_PORT, () => {
	console.log("🚀 server running on port 3001");
});

// -- EXPRESS -- //

// include static middleware to be able to serve images from Express server
app.use(express.static("public"));
// require("dotenv").config();
// const PORT = process.env.PORT;

app.use("/users", userRouter);
app.use("/chat", chatRouter);

// Listen on PORT CLIENT__URL and provide a success callback function
// app.listen(process.env.PORT, () => {
// 	console.log("🚀 Server listening on ", process.env.PORT);
// });

app.listen(process.env.PORT, () => {
	console.log("🚀 Server listening on ", 8000);
});
