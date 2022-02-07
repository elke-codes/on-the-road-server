const express = require("express");
const fs = require("fs");
const router = express.Router();
const { v4: uuid } = require("uuid");
//-- be able to send json body when post
router.use(express.json());
// -- Helper functions -- //
const readData = () => {
	const usersData = fs.readFileSync("./data/users.json");
	return JSON.parse(usersData);
};

const writeData = (usersData) => {
	// JSON.stringify takes additional parameters, that allow us to specify the amounts of white space (ie, indentation) in the file
	fs.writeFileSync("./data/users.json", JSON.stringify(usersData, null, 2));
};

router.get("/:loggedInUserID/:roomID", (req, res) => {
	const usersData = readData();

	const loggedInUserID = req.params.loggedInUserID;
	const loggedInUser = usersData.find((user) => {
		return user.id === loggedInUserID;
	});

	const loggedInUsersMessages = loggedInUser.messages;
	const messagesInThisRoom = loggedInUsersMessages.filter((message) => {
		return message.room === req.params.roomID;
	});

	console.log("messagesinthis room", messagesInThisRoom);
	console.log("loggedinuser", loggedInUser);

	res.status(200).json(messagesInThisRoom);
});
module.exports = router;
