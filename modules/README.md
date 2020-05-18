# Modules

In the interest of good code organization, proper software development practices, and ease of maintenance, I created these three modules: `authentication.js`, `rssfetch.js`, and `sqlconnection.js`.

`authentication.js` contains the key authentication and encrpyted password comparison that allows this app to be secure. It pulls the hashed password out of the database and compares it with the hashed password that the user sends. This middleware function is called for nearly every route in the `user.js` route in the `../routes/` folder.

`rssfetch.js` contains the mechanism through which I invoke The Dartmouth's RSS API, and a few helper functions to help compare entries and see if they belong to our chosen authors and categories.

`sqlconnection.js` contains the database connection pool that I execute all SQL with, as well as a few middleware functions to cleanly convert favorited categories and authors from the database to RSS-feed-filtering-compatible format.
