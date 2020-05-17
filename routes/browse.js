/**
 * Routes for all general RSS filtering related stuff
 */

// imports
const express = require("express");
const bodyParser = require("body-parser");
const browseRouter = express.Router();
browseRouter.use(bodyParser.urlencoded({ extended: true }));
browseRouter.use(bodyParser.json());

const {
	fetchFeed,
	arrayMatches,
	twoArrayMatches,
} = require("../modules/rssfetch");

/**************** NON-AUTHENTICATED GENERAL ROUTES *******************/

/**
 * GET /all
 *
 * gets the general feed, same thing as querying the RSS feed directly
 */
browseRouter.get("/all", fetchFeed, (req, res) => {
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
browseRouter.get("/category/:category", fetchFeed, (req, res) => {
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
browseRouter.get("/category", fetchFeed, (req, res) => {
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
browseRouter.get("/author/:author", fetchFeed, (req, res) => {
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
 * GET /author/
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
browseRouter.get("/author", fetchFeed, (req, res) => {
	console.log(req.body.authors);
	if (!req.body.authors) {
		res.send(JSON.stringify({ status: 404, error: "no authors requested" }));
		return;
	}
	// use helper function below
	const results = arrayMatches(req.body.authors, req.feed, "author");
	res.send(JSON.stringify({ status: 200, error: null, response: results }));
});

module.exports = browseRouter;
