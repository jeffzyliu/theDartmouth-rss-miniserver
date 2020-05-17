/**
 * the Dartmouth RSS API querier
 *
 * A lightweight web server to interact with the RSS API for the D.
 * Allows general queries of articles by content tags and also manages
 * a database of users with salt+pepper encrypted passwords, who can
 * edit a few of their own credentials and create a list of their favorite
 * tags so they can browse a curated feed
 *
 * Usage: node index.js or npx nodemon index.js
 *
 * frontend: postman is my frontend :)
 *
 * @author Jeff Liu
 * @date May 2020
 */

/**************  BOILERPLATE AND SETUP  *************/
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const app = express();
const Parser = require("rss-parser");
const parser = new Parser();
// password setup
const bcrypt = require("bcrypt");
const saltRounds = 10;
// env setup
const env = "local"; // CHANGE THIS TO HEROKU FOR DEPLOY MODE AND LOCAL FOR TEST MODE
const config = require("./config")[env];
// async MySQL db setup
global.pool = mysql.createPool(config.database);

app.use((req, res, next) => {
	console.log("/" + req.method);
	next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + "/"));
app.set("port", process.env.PORT || config.port || 3000);
app.listen(app.get("port"), () => {
	console.log("Server listening on port " + app.get("port"));
	console.log("Environment is " + env);
});

/**
 * helper middleware to fetch the entire RSS reed before our GETs process it
 *
 * @param {*} req standard req
 * @param {*} res unused response
 * @param {*} next standard to pass on to next middleware
 */
const fetchFeed = async (req, res, next) => {
	let feed = await parser.parseURL(
		"https://www.thedartmouth.com/plugin/feeds/the-dartmouth-articles-feed.xml"
	);
	req.feed = feed.items.map((item) => ({
		title: item.title,
		author: item.author,
		categories: item.categories,
		pubDate: item.pubDate,
		content: item.content,
	}));
	next();
};

// app.use(async (req, res, next) => {
//   const [rows, fields] = await global.pool.execute("select * from Users");
// 	console.log(rows);
// });

// blank GET to test connection
app.get("/", (req, res) => {
	res.send("server's up what's up :)))");
});

/**
 * GET /all
 *
 * gets the general feed, same thing as querying the RSS feed directly
 */
app.get("/all", fetchFeed, (req, res) => {
	// console.log(req.feed);
	res.send(JSON.stringify({ status: 200, error: null, response: req.feed }));
});

/**
 * GET /category/:category
 *
 * looks up a single category by category string, and returns all articles on the feed
 * that match this category, case insensitive
 *
 * @input params:
 *    category
 *
 * @return
 *    200 success
 */
app.get("/category/:category", fetchFeed, (req, res) => {
	console.log(req.params.category);
	let results = req.feed.filter((item) => {
		if (!item.categories) return false;
		let boolean = false;
		// case insensitive comparison to see if category exists in an article
		JSON.parse(JSON.stringify(item.categories)).forEach((category) => {
			boolean =
				boolean || category.toLowerCase() === req.params.category.toLowerCase();
		});
		return boolean;
	});
	res.send(JSON.stringify({ status: 200, error: null, response: results }));
});

/**
 * GET /category/
 *
 * looks up a collection of categories by category string, and returns all articles
 * on the feed that match this category, case insensitive
 *
 * @input body:
 *    categories: []
 *
 * @return
 *    200 success
 *    404 for no categories
 */
app.get("/category", fetchFeed, (req, res) => {
	console.log(req.body.categories);
	if (!req.body.categories) {
		res.send(JSON.stringify({ status: 404, error: "no categories requested" }));
		return;
	}
	// use helper function below for cleaner code
	const results = twoArrayMatches(req.body.categories, req.feed, "categories");
	res.send(JSON.stringify({ status: 200, error: null, response: results }));
});

/**
 * helper function used to match all feed items with an array of attributes
 * that matches up with any attribute of a parameter type in our reqArray
 *
 * basically tries to find set intersection
 *
 * case-insensitive
 *
 * @param {Array} reqArray list of attributes we care about
 * @param {Array} feedArray feed of RSS articles to filter through
 * @param {String} searchParam what type of attribute we search
 */
const twoArrayMatches = (reqArray, feedArray, searchParam) => {
	const reqSet = new Set(reqArray.map((reqItem) => reqItem.toLowerCase()));
	return feedArray.filter((feedItem) => {
		if (!feedItem[searchParam]) return false;
		let boolean = false;
		// looks for cartesian product match
		JSON.parse(JSON.stringify(feedItem[searchParam])).forEach((param) => {
			boolean = boolean || reqSet.has(param.toLowerCase());
		});
		return boolean;
	});
};

/**
 * GET /author/:author
 *
 * looks up a single author by author name string, and returns all articles on the feed
 * that match this author, case insensitive
 *
 * @input params:
 *    author
 *
 * @return
 *    200 success
 */
app.get("/author/:author", fetchFeed, (req, res) => {
	console.log(req.params.author);
	// look for author name
	let results = req.feed.filter(
		(item) =>
			item.author &&
			item.author.toLowerCase() === req.params.author.toLowerCase()
	);
	res.send(JSON.stringify({ status: 200, error: null, response: results }));
});

/**
 * GET /category/
 *
 * looks up a collection of authors by author name string, and returns all articles
 * on the feed that match these authors, case insensitive
 *
 * @input body:
 *    authors: []
 *
 * @return
 *    200 success
 *    404 for no authors
 */
app.get("/author", fetchFeed, (req, res) => {
	console.log(req.body.authors);
	if (!req.body.authors) {
		res.send(JSON.stringify({ status: 404, error: "no authors requested" }));
		return;
	}
	// use helper function below
	const results = arrayMatches(req.body.authors, req.feed, "author");
	res.send(JSON.stringify({ status: 200, error: null, response: results }));
});

/**
 * helper function used to match all feed items that contain
 * any attribute of a parameter type in our reqArray
 *
 * case-insensitive
 *
 * @param {Array} reqArray list of attributes we care about
 * @param {Array} feedArray feed of RSS articles to filter through
 * @param {String} searchParam what type of attribute we search
 */
const arrayMatches = (reqArray, feedArray, searchParam) => {
	const reqSet = new Set(reqArray.map((reqItem) => reqItem.toLowerCase()));
	return feedArray.filter(
		(feedItem) =>
			feedItem[searchParam] && reqSet.has(feedItem[searchParam].toLowerCase())
	);
};

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
		] = await global.pool.execute(
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

/**
 * GET /login
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
app.get("/login", authenticate, (req, res) => {
	console.log(req.body);
	res.send(JSON.stringify({ status: 200, error: "null", UserID: req.UserID }));
});

/**
 * helper middleware to query the database for authors
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const queryAuthors = async (req, res, next) => {
	let authors, fields;
	try {
		[
			authors,
			fields,
		] = await global.pool.execute(
			"SELECT AuthorID, AuthorName FROM " +
				config.database.database +
				".SavedAuthors WHERE UserID = ?",
			[req.UserID]
		);
	} catch (error) {
		console.log(error);
		res.send(JSON.stringify({ status: 500, error: "internal server error" }));
		return;
	}
	console.log(authors);
	req.SavedAuthors = authors;
	next();
};

/**
 * helper middleware to query the database for tags/categories
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const queryTags = async (req, res, next) => {
	let tags, fields;
	try {
		[tags, fields] = await global.pool.execute(
			"SELECT TagID, TagString FROM " +
				config.database.database +
				".SavedTags WHERE UserID = ?",
			[req.UserID]
		);
	} catch (error) {
		console.log(error);
		res.send(JSON.stringify({ status: 500, error: "internal server error" }));
		return;
	}
	console.log(tags);
	req.SavedTags = tags;
	next();
};

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
app.get("/user", authenticate, queryAuthors, queryTags, async (req, res) => {
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

const parseQueriedAuthors = (req, res, next) => {
	if (!req.SavedAuthors) next();
	req.ParsedAuthors = req.SavedAuthors.map((author) => author.AuthorName);
	console.log(req.ParsedAuthors);
	next();
};

const parseQueriedTags = (req, res, next) => {
	if (!req.SavedTags) next();
	req.ParsedTags = req.SavedTags.map((tag) => tag.TagString);
	console.log(req.ParsedTags);
	next();
};

app.get(
	"/user/feed",
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
		res.send(
			JSON.stringify({
				status: 200,
				error: "null",
				response: results,
			})
		);
	}
);

/**
 * helper function that combines the functionality of the two earlier array matching
 * functions, god help me this is convoluted
 *
 * case-insensitive
 *
 * @param {Array} reqArray1 list of attributes we care about (belongs to set)
 * @param {Array} reqArray2 of attributes we care about (has intersection of sets)
 * @param {Array} feedArray feed of RSS articles to filter through
 * @param {String} searchParam1 first search parameter (belongs)
 * @param {String} searchParam2 second search parameter (intersection)
 */
const arrayAndTwoArrayMatches = (
	reqArray1,
	reqArray2,
	feedArray,
	searchParam1,
	searchParam2
) => {
	const reqSet1 = new Set(reqArray1.map((reqItem) => reqItem.toLowerCase()));
	const reqSet2 = new Set(reqArray2.map((reqItem) => reqItem.toLowerCase()));
	return feedArray.filter((feedItem) => {
		if (!feedItem[searchParam1] && !feedItem[searchParam2]) return false;
		let boolean = false;
		// look for belongs on 1
		if (feedItem[searchParam1]) {
			boolean = boolean || reqSet1.has(feedItem[searchParam1].toLowerCase());
		}
		// avoid expensive category search if author search worked
		if (boolean) return true;
		// look for set intersection on 2
		if (feedItem[searchParam2]) {
			JSON.parse(JSON.stringify(feedItem[searchParam2])).forEach((param) => {
				boolean = boolean || reqSet2.has(param.toLowerCase());
			});
		}
		return boolean;
	});
};

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
app.post("/user", async (req, res) => {
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
		[results, fields] = await global.pool.execute(
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
