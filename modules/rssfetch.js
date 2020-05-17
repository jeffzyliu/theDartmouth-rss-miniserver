/**
 * Module for wrapping RSS fetch requests, cleaning up SQL queries,
 * and some set intersection/belonging helper functions
 *
 * includes both middleware and helper functions
 *
 * @author Jeff Liu
 * @date May 2020
 */

const Parser = require("rss-parser");
const parser = new Parser();

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

module.exports = {
	fetchFeed,
	arrayMatches,
	twoArrayMatches,
	arrayAndTwoArrayMatches,
};
