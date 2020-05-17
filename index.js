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
const mysql = require("mysql2");
const app = express();
const Parser = require("rss-parser");
const parser = new Parser();
// password setup
const bcrypt = require("bcrypt");
const saltRounds = 10;

// const dbConfig = {
// 	host: "localhost",
// 	user: "serveruser",
// 	password: "s3rv3rp4ssw0rd",
// 	schema: "theDartmouth",
// };
// global.connection = mysql.createConnection(dbConfig);
// connection.connect();

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
	req.feed = feed;
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
	global.connectt;
};

// const testMiddleware = async (req,res,next) => {
//   let feed = await parser.parseURL('https://www.thedartmouth.com/plugin/feeds/news.xml');
//   console.log(feed.title);
//   next();
// }

app.get("/", (req, res) => {
	res.send("server's up what's up :)))");
});

app.get("/all", fetchFeed, (req, res) => {
	// console.log(req.feed);
	res.send(
		req.feed.items.map((item) => ({
			title: item.title,
			author: item.author,
			categories: item.categories,
			pubDate: item.pubDate,
			content: item.content,
		}))
	);
});

app.get("/category/:category", fetchFeed, (req, res) => {
	console.log(req.params.category);
	let results = req.feed.items
		.map((item) => ({
			title: item.title,
			author: item.author,
			categories: item.categories,
			pubDate: item.pubDate,
			content: item.content,
		}))
		.filter((item) => {
			if (!item.categories) return false;
			let boolean = false;
			JSON.parse(JSON.stringify(item.categories)).forEach((category) => {
				boolean =
					boolean ||
					category.toLowerCase() === req.params.category.toLowerCase();
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
	const categoriesSet = new Set(
		req.body.categories.map((category) => category.toLowerCase())
	);
	let results = req.feed.items
		.map((item) => ({
			title: item.title,
			author: item.author,
			categories: item.categories,
			pubDate: item.pubDate,
			content: item.content,
		}))
		.filter((item) => {
			if (!item.categories) return false;
			let boolean = false;
			JSON.parse(JSON.stringify(item.categories)).forEach((category) => {
				boolean = boolean || categoriesSet.has(category.toLowerCase());
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

app.get("/author/:author", fetchFeed, (req, res) => {
	console.log(req.params.author);
	let results = req.feed.items
		.map((item) => ({
			title: item.title,
			author: item.author,
			categories: item.categories,
			pubDate: item.pubDate,
			content: item.content,
		}))
		.filter(
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
		res.send(
			JSON.stringify({
				status: 404,
				error: "no authors requested",
			})
		);
	}
	const authorSet = new Set(
		req.body.authors.map((author) => author.toLowerCase())
	);
	let results = req.feed.items
		.map((item) => ({
			title: item.title,
			author: item.author,
			categories: item.categories,
			pubDate: item.pubDate,
			content: item.content,
		}))
		.filter((item) => item.author && authorSet.has(item.author.toLowerCase()));
	res.send(
		JSON.stringify({
			status: 200,
			error: null,
			response: results,
		})
	);
});
