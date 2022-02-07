/// ---USERROUTE.JS --- ///

const express = require("express");
const fs = require("fs");
const router = express.Router();
const { v4: uuid } = require("uuid");
const emailExists = require("../utils/validations/emailExists");
const userNameExists = require("../utils/validations/userNameExists");
const emailValid = require("../utils/validations/emailValid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

const SALT_ROUNDS = 8;
// const JWT_SECRET = process.env.JWT_SECRET;

// -- Helper functions -- //
const readData = () => {
	const usersData = fs.readFileSync("./data/users.json");
	return JSON.parse(usersData);
};

const writeData = (usersData) => {
	// JSON.stringify takes additional parameters, that allow us to specify the amounts of white space (ie, indentation) in the file
	fs.writeFileSync("./data/users.json", JSON.stringify(usersData, null, 2));
};

//-- be able to send json body when post
router.use(express.json());

//-- ROUTES --//

/// GET ALL USERS
router.get("/", (req, res) => {
	// console.log("trying to get users");
	const usersData = readData();
	// console.log(`got users ${usersData}`);
	// console.log(usersData);
	res.status(200).json(usersData);
});

//GET FRIEND for the logged in user
router.get("/:loggedInUserID/friends", (req, res) => {
	const userData = readData();

	const loggedInUser = userData.find((user) => {
		return req.params.loggedInUserID === user.id;
	});

	const friends = loggedInUser.friends;
	console.log("friends", friends);

	//create an array of friend id;s
	//find all the users with that id and return their data
	const friendsData = friends
		.map((friend) => friend.id)
		.map((friendId) => userData.find((user) => user.id === friendId));

	console.log("friendsData", friendsData);
	res.status(200).json(friendsData);
});

///GET FIND FRIEND in database(json for now) and add them to the logged in users' friend list

router.get("/:loggedInUserID/:friendToFindUserNameOrEmail", (req, res) => {
	// look in db and find a user with either username or email address and return that user
	const userData = readData();
	const friendToFind = req.params.friendToFindUserNameOrEmail;
	// console.log("friend to find", friendToFind);

	//TODO ADD FRIEND BY EMAIL
	const foundFriend = userData.find((user) => {
		return user.userName === friendToFind;
	});
	if (!foundFriend) {
		return res.status(404).json({
			message:
				"could not find your friend in out files, would you like to invite them to the Wayward.club?"
		});
	}

	console.log("found friend", foundFriend);
	//take the found friend user info that was returned and add them the the loggedinusers friend array

	const loggedInUser = userData.find((user) => {
		return user.id === req.params.loggedInUserID;
	});
	console.log("loggedinuser", loggedInUser);

	const loggedInUserFriends = loggedInUser.friends;
	console.log("loggedinuser friends", loggedInUserFriends);

	loggedInUserFriends.push({
		id: foundFriend.id,
		userName: foundFriend.userName
	});

	console.log(
		"loggedinuserFriends after push found friend",
		loggedInUserFriends
	);

	// also push the loggedinuser to the foundfriend.friends array (for now there will be no confirmation TODO: email confirmation to confirm being friends? or in app on the users' profile page?)
	const foundFriendFriends = foundFriend.friends;
	foundFriendFriends.push({
		id: loggedInUser.id,
		userName: loggedInUser.userName
	});

	//write the new info to the database(jsnon for now)
	//update only the newly added friend in the array of users
	writeData(userData);
	res.status(200).json(foundFriend);
});

///GET logged in user
router.get("/:userName", (req, res) => {
	const userData = readData();
	// console.log("get logged in user", req.params.userName);
	const loggedInUser = userData.find((user) => {
		return user.userName === req.params.userName;
	});
	// console.log("found user", loggedInUser);
	res.status(200).json(loggedInUser);
});

//POST REGISTER new user
//async to wait for password to be hashed
router.post("/register", async (req, res) => {
	const userData = readData();

	if (userNameExists(userData, req.body.userName)) {
		return res.status(422).json({ message: "Username already taken." });
	}

	if (emailExists(userData, req.body.email)) {
		return res
			.status(422)
			.json({ message: "Email address already taken." });
	}
	if (!emailValid(req.body.email)) {
		return res.status(422).json({
			message:
				"Email address invalid. Please provide a an email that looks more like this yourname@yourcompany.com"
		});
	}

	const { password } = req.body;
	console.log("password", password);
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	console.log("hashed", hashedPassword);

	const newUser = {
		userName: req.body.userName,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hashedPassword,
		id: uuid(),
		friends: [],
		messages: [],
		locations: [
			{
				lat: req.body.lat,
				lng: req.body.lng,
				created_at: new Date(),
				// TODO updated_at to create travel history
				city: req.body.city,
				country: req.body.country
			}
		]
	};

	userData.push(newUser);
	writeData(userData);
	res.status(201).json(newUser);
});

///POST LOGIN login the user if username and password are correct

router.post("/login", async (req, res) => {
	const { userName, password } = req.body;
	const users = readData();

	const user = users.find((user) => {
		//TODO add logic for when username not found to be set to front end, wich is already set up to display the error message
		return userName === user.userName;
	});

	if (!user) {
		return res.status(404).send("user not found");
	}

	const passwordValid = await bcrypt.compare(password, user.password);
	console.log("passwordvalid", passwordValid);
	if (!passwordValid) {
		return res.status(422).json({ message: "password not correct" });
	}

	res.status(200).send(passwordValid);
});

module.exports = router;
