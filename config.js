var config = {
	heroku: {
		database: {
			host: "us-cdbr-east-06.cleardb.net",
			user: "b166f73b524787",
			password: "0f888be1",
			database: "heroku_0e9c350bac7b354",
		},
		port: 3000,
	},
	local: {
		database: {
			host: "localhost",
			user: "serverUser",
			password: "s3rv3rp4ssw0rd",
			database: "theDartmouth",
		},
		port: 3000,
	},
};

module.exports = config;
