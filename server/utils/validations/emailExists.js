module.exports = (users, email) => {
	const existingEmail = users.find((user) => user.email === email);

	if (existingEmail) {
		return true;
	} else {
		return false;
	}
};
