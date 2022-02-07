const express = require("express");
const fs = require("fs");
const router = express.Router();

const readData = () => {
	// The readFileSync path is relative to where server.js file is
	const friendsData = fs.readFileSync("./users.json");
	return JSON.parse(friendsData);
};

const writeData = () => {
	// JSON.stringify takes additional parameters, that allow us to specify the amounts of white space (ie, indentation) in the file
	fs.writeFileSync("./data/users.json", JSON.stringify(usersData, null, 2));
};

// const writeFile = (friendsData) => {
// 	// JSON.stringify takes additional parameters, that allow us to specify the amounts of white space (ie, indentation) in the file
// 	fs.writeFileSync("./friends.json", JSON.stringify(friendsData, null, 2));
// };

// router.get("/geo-reverse", (req, res) => {
// 	let userData = fs.readFileSync("./users.json");

// 	let current = userData.find((user) => {
// 		userID === user.id;
// 	});

// 	// const country = res.data.properties.country;
// 	// const city = res.data.properties.city;

// 	const city = res.status(200);
// });
