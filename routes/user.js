/**
 * Routes for all user account related stuff
 */

// imports
const express = require("express");
const bodyParser = require("body-parser");
const userRouter = express.Router();
userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.use(bodyParser.json());

// password setup
const bcrypt = require("bcrypt");
const saltRounds = 10;
// env setup
const env = require("../env"); // CHANGE THIS TO HEROKU FOR DEPLOY MODE AND LOCAL FOR TEST MODE
const config = require("../config")[env];

const {
	fetchFeed,
	arrayMatches,
	twoArrayMatches,
	arrayAndTwoArrayMatches,
} = require("../modules/rssfetch");
const {
	connection,
	queryAuthors,
	queryTags,
	parseQueriedAuthors,
	parseQueriedTags,
} = require("../modules/sqlconnection");
const authenticate = require("../modules/authentication");

/**************** AUTHENTICATED ROUTES FOR USER ACCOUNTS AND PERSONAL FEEDS*******************/

/**
 * GET /user/login
 * does a login attempt to verify authentication before continuing
 *
 * @input body:
 *    Username
 *    Password
 * @return
 *    200 success message with UserID of logged user
 *    401 for login failure
 *    500 for uncaught server error
 */
userRouter.get("/login", authenticate, (req, res) => {
	console.log(req.body);
	res.send(JSON.stringify({ status: 200, error: "null", UserID: req.UserID }));
});

/**
 * GET /user
 * grabs a list of a user's favorite authors and categories
 *
 * @input body:
 *    Username
 *    Password
 * @return
 *    200 success message with arrays of authors and tags
 *    401 for login failure
 *    500 for uncaught server error
 */
userRouter.get("/", authenticate, queryAuthors, queryTags, async (req, res) => {
	console.log(req.body);
	res.send(
		JSON.stringify({
			status: 200,
			error: "null",
			SavedAuthors: req.SavedAuthors,
			SavedTags: req.SavedTags,
		})
	);
});

/**
 * GET /user/feed
 * grabs a feed containing all recent articles that either
 * are written by one of the user's favorite authors or
 * are on one of the user's favorite categories
 *
 * @input body:
 *    Username
 *    Password
 *
 * @return
 *    200 success message with matching posts
 *    401 for login failure
 *    500 for uncaught server error
 */
userRouter.get(
	"/feed",
	authenticate,
	queryAuthors,
	parseQueriedAuthors,
	queryTags,
	parseQueriedTags,
	fetchFeed,
	(req, res) => {
		console.log(req.body);
		const results = arrayAndTwoArrayMatches(
			req.ParsedAuthors,
			req.ParsedTags,
			req.feed,
			"author",
			"categories"
		);
		res.send(JSON.stringify({ status: 200, error: "null", response: results }));
	}
);

/**
 * GET /user/author
 * grabs a feed containing all recent articles that
 * are written by one of the user's favorite authors
 *
 * @input body:
 *    Username
 *    Password
 *
 * @return
 *    200 success message with matching posts
 *    401 for login failure
 *    500 for uncaught server error
 */
userRouter.get(
	"/author",
	authenticate,
	queryAuthors,
	parseQueriedAuthors,
	fetchFeed,
	(req, res) => {
		console.log(req.body);
		const results = arrayMatches(req.ParsedAuthors, req.feed, "author");
		res.send(JSON.stringify({ status: 200, error: "null", response: results }));
	}
);

/**
 * GET /user/category
 * grabs a feed containing all recent articles that
 * are on one of the user's favorite categories
 *
 * @input body:
 *    Username
 *    Password
 *
 * @return
 *    200 success message with matching posts
 *    401 for login failure
 *    500 for uncaught server error
 */
userRouter.get(
	"/category",
	authenticate,
	queryTags,
	parseQueriedTags,
	fetchFeed,
	(req, res) => {
		console.log(req.body);
		const results = twoArrayMatches(req.ParsedTags, req.feed, "categories");
		res.send(JSON.stringify({ status: 200, error: "null", response: results }));
	}
);

/**
 * POST /user
 * creates a new RSS user who can add and remove tags/authors as they wish
 *
 * @input
 *    Username
 *    Password
 *
 * @return
 *    201 success message if success (response.insertId = new userID in schema)
 *    1000 error if duplicate username
 *    500 for uncaught server error
 */
userRouter.post("/", async (req, res) => {
	console.log(req.body);
	let HashedPassword;
	try {
		// attempt to hash the password
		HashedPassword = await bcrypt.hash(req.body.Password, saltRounds);
	} catch (error) {
		console.log(error); // password not found
		res.send(JSON.stringify({ status: 500, error: "bad format" }));
		return;
	}
	let results, fields;
	try {
		// insert the new user
		[results, fields] = await connection.execute(
			"INSERT INTO " +
				config.database.database +
				".Users (Username, HashedPassword) VALUES (?, ?)",
			[req.body.Username, HashedPassword]
		);
	} catch (err) {
		// duplicate username, bad request, or other errors
		if (err.errno == 1062) {
			console.log("duplicate username rejected");
			res.send(JSON.stringify({ status: 1000, error: "duplicate username" }));
		} else {
			console.log(error);
			res.send(JSON.stringify({ status: 500, error: "internal server error" }));
		}
		return;
	}
	// send a confirmation message back to client
	res.send(JSON.stringify({ status: 201, error: null, response: results }));
});

module.exports = userRouter;
