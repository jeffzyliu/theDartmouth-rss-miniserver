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

/**************  BOILERPLATE AND IMPORTS *************/
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// env setup
const env = require("./env"); // CHANGE THIS TO HEROKU FOR DEPLOY MODE AND LOCAL FOR TEST MODE
const config = require("./config")[env];

/**************** REMAINING SETUP *******************/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
	console.log("/" + req.method);
	next();
});

// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + "/"));
app.set("port", process.env.PORT || config.port || 3000);
app.listen(app.get("port"), () => {
	console.log("Server listening on port " + app.get("port"));
	console.log("Environment is " + env);
});

// blank GET to test connection
app.get("/", (req, res) => {
	res.send("server's up what's up :)))");
});

/**********************************************/
/**************** API LOGIC *******************/
/**********************************************/

// (it's not here, all in routes because yay organization!)

const userRouter = require("./routes/user");
const browseRouter = require("./routes/browse");

app.use("/user", userRouter);
app.use("/", browseRouter);
