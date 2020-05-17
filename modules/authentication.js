/**
 * small module to encapsulate authentication
 */

// password setup
const bcrypt = require("bcrypt");
// env setup
const env = require("../env"); // CHANGE THIS TO HEROKU FOR DEPLOY MODE AND LOCAL FOR TEST MODE
const config = require("../config")[env];
const { connection } = require("./sqlconnection");

/**
 * Core authentication middleware for users
 *
 * @param {*} req standard req, needs a body w/ username and password
 * @param {*} res response if an error message should be sent
 * @param {*} next standard to pass on execution to next middleware
 */
const authenticate = async (req, res, next) => {
	// null checks
	if (
		req == null ||
		req.body == null ||
		req.body.Username == null ||
		req.body.Password == null
	) {
		console.log("invalid login");
		res.send(JSON.stringify({ status: 401, error: "login invalid" }));
		return false;
	}
	let results, fields;
	// try to pull the userID and password from the database that matches username
	try {
		[
			results,
			fields,
		] = await connection.execute(
			"SELECT UserID, HashedPassword FROM " +
				config.database.database +
				".Users WHERE Username LIKE ?",
			[req.body.Username]
		);
	} catch (error) {
		console.log(error);
		res.send(JSON.stringify({ status: 500, error: "internal server error" }));
		return;
	}
	// username did not exist
	if (results.length == 0) {
		console.log("user not found");
		res.send(JSON.stringify({ status: 401, error: "username not found" }));
		return;
	}
	// username did exist, compare hashed passwords
	if (!(await bcrypt.compare(req.body.Password, results[0].HashedPassword))) {
		// wrong pass
		console.log("wrong password, login fail");
		res.send(JSON.stringify({ status: 401, error: "incorrect password" }));
		return;
	}
	// correct pass
	console.log(req.body.Username + " login success");
	// console.log(results[0]);
	req.UserID = results[0].UserID;
	next();
};

module.exports = authenticate;
