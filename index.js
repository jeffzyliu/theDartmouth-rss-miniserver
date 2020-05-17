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
const app = express();
const Parser = require("rss-parser");
const parser = new Parser();

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
	// console.log(feed.title);
	next();
};

// const testMiddleware = async (req,res,next) => {
//   let feed = await parser.parseURL('https://www.thedartmouth.com/plugin/feeds/news.xml');
//   console.log(feed.title);
//   next();
// }

// blank GET to test connection
app.get("/", fetchFeed, (req, res) => {
	console.log(req.feed);

	// req.feed.items.forEach(item => {
	//     console.log(item.title + ':' + item.link)
	// });

	// res.send("server's up what's up :)))");
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

app.get("/:category", fetchFeed, (req, res) => {
	console.log(req.params.category);

	let items = req.feed.items.map((item) => ({
		title: item.title,
		author: item.author,
		categories: item.categories,
		pubDate: item.pubDate,
		content: item.content,
	}));

	// let newitems = items.filter((item) => {
	//   item.author == "Anna May Mott";
	// });
	// console.log(typeof JSON.parse(JSON.stringify(items[0].categories)));
	// console.log(
	//   JSON.parse(JSON.stringify(items[0].categories)).includes("Sports")
	// );
	// console.log(new Array(items[0].categories));
	let newitems = items.filter((item) => {
		// item.categories && console.log(JSON.parse(JSON.stringify(item.categories)));
		if (!item.categories) return;
		let boolean = false;
		JSON.parse(JSON.stringify(item.categories)).forEach((category) => {
			// console.log(category);
			boolean =
				boolean || category.toLowerCase() === req.params.category.toLowerCase();
		});
		// console.log(typeof categories);

		// console.log(boolean);
		return boolean;
		// return categories.includes(req.params.category);
	});

	res.send(newitems);
});
