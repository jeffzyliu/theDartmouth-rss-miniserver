/**
 * short module to maintain the sql connection separately
 * with a few extra middleware functions to query some authors and tags
 */

const mysql = require("mysql2/promise");
// env setup
const env = require("../env"); // CHANGE THIS TO HEROKU FOR DEPLOY MODE AND LOCAL FOR TEST MODE
const config = require("../config")[env];
// async MySQL db setup
global.pool = mysql.createPool(config.database);

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

module.exports = {
	connection: global.pool,
	queryAuthors,
	queryTags,
	parseQueriedAuthors,
	parseQueriedTags,
};
