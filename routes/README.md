# Routes

To break up the code out of index.js and for ease of maintenance, I created two router modules: `user.js` and `browse.js`.

`user.js` handles all routes pertaining to user accounts and authentication. Logged-in sessions will all be handled through this.

`browse.js` handles public routes for anybody who wants to use this API to smartly query the RSS feed.
