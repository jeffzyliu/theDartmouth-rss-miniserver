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

// global.connection = mysql.createConnection(dbConfig);

// const createdb = async () => {
const dbConfig = {
	host: "localhost",
	user: "serverUser",
	password: "s3rv3rp4ssw0rd",
	database: "theDartmouth",
};

global.pool = mysql.createPool(dbConfig);
// };

// createdb();

// const [rows, fields] = global.pool.execute("select * from Users");
// console.log(rows);

app.use((req, res, next) => {
	console.log("/" + req.method);
	next();
});

// const env = 'local';
// const config = require('./config')[env];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + "/"));
app.set("port", 3000);
app.listen(app.get("port"), () => {
	console.log("Server listening on port " + app.get("port"));
	//   console.log( 'Environment is ' + env);
});

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

// TODO: need to set up mysql schema, then add the boilerplate up top, then develop authentication
const authenticate = async (req, res, next) => {
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
	try {
		const [
			rows,
			fields,
		] = await global.pool.execute(
			"SELECT UserID, HashedPassword FROM Users WHERE Username LIKE ?",
			[req.body.Username]
		);
		console.log(rows);
		console.log(fields);
	} catch (error) {
		console.log(error);
	}
	next();
};

// const testMiddleware = async (req,res,next) => {
//   let feed = await parser.parseURL('https://www.thedartmouth.com/plugin/feeds/news.xml');
//   console.log(feed.title);
//   next();
// }

// app.use(async (req, res, next) => {
//   const [rows, fields] = await global.pool.execute("select * from Users");
// 	console.log(rows);
// });

app.get("/", authenticate, (req, res) => {
	res.send("server's up what's up :)))");
});

app.get("/all", fetchFeed, (req, res) => {
	// console.log(req.feed);
	res.send(JSON.stringify({ status: 200, error: null, response: req.feed }));
});

app.get("/category/:category", fetchFeed, (req, res) => {
	console.log(req.params.category);
	let results = req.feed.filter((item) => {
		if (!item.categories) return false;
		let boolean = false;
		JSON.parse(JSON.stringify(item.categories)).forEach((category) => {
			boolean =
				boolean || category.toLowerCase() === req.params.category.toLowerCase();
		});
		return boolean;
	});
	res.send(
		JSON.stringify({
			status: 200,
			error: null,
			response: results,
		})
	);
});

app.get("/category", fetchFeed, (req, res) => {
	console.log(req.body.categories);
	if (!req.body.categories) {
		res.send(
			JSON.stringify({
				status: 404,
				error: "no categories requested",
			})
		);
	}
	const results = twoArrayMatches(req.body.categories, req.feed, "categories");
	res.send(
		JSON.stringify({
			status: 200,
			error: null,
			response: results,
		})
	);
});

const twoArrayMatches = (reqArray, feedArray, searchParam) => {
	const reqSet = new Set(reqArray.map((reqItem) => reqItem.toLowerCase()));
	return feedArray.filter((feedItem) => {
		if (!feedItem[searchParam]) return false;
		let boolean = false;
		JSON.parse(JSON.stringify(feedItem[searchParam])).forEach((param) => {
			boolean = boolean || reqSet.has(param.toLowerCase());
		});
		return boolean;
	});
};

app.get("/author/:author", fetchFeed, (req, res) => {
	console.log(req.params.author);
	let results = req.feed.filter(
		(item) =>
			item.author &&
			item.author.toLowerCase() === req.params.author.toLowerCase()
	);
	res.send(
		JSON.stringify({
			status: 200,
			error: null,
			response: results,
		})
	);
});

app.get("/author", fetchFeed, (req, res) => {
	console.log(req.body.authors);
	if (!req.body.authors) {
		res.send(JSON.stringify({ status: 404, error: "no authors requested" }));
	}
	const results = arrayMatches(req.body.authors, req.feed, "author");
	res.send(
		JSON.stringify({
			status: 200,
			error: null,
			response: results,
		})
	);
});

const arrayMatches = (reqArray, feedArray, searchParam) => {
	const reqSet = new Set(reqArray.map((reqItem) => reqItem.toLowerCase()));
	return feedArray.filter(
		(feedItem) =>
			feedItem[searchParam] && reqSet.has(feedItem[searchParam].toLowerCase())
	);
};
