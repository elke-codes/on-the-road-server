//check all the users to see if the username already exist
// return true if it exists, false if not
module.exports = (users, userName) => {
	const existingUser = users.find((user) => user.userName === userName);

	if (existingUser) {
		return true;
	} else {
		return false;
	}
};
