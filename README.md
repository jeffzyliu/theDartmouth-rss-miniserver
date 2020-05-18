# Mini Server for The Dartmouth's RSS API

## Jeff Liu, May 2020

A lightweight RESTful API built with node/express to query The Dartmouth's RSS feed in a more intelligible manner.
https://thedartmouth-rss-browser.herokuapp.com


#### Functionality:
* Query individual categories (i.e. news, opinion) or individual authors and find their recent articles
* Query groups of categories or authors through the body of a GET request to find all matching articles
* Create/Read/Update/Delete user accounts to curate one's favorite categories and authors for a personalized RSS feed
* Secure hashed password protection to keep our beautiful RSS feeds safe from others' tampering, because RSS feeds are what truly matters in life

#### Implementation:
* Node/Express/Router server deployed using Heroku App to the link at the top
* Relational database for account info using MySQL and ClearDB
* Secure salt-and-pepper password hashing using BCrypt
* RSS to JSON parsing through rss-parser, with my own wrapper around it to make it simpler
* RESTful API through Express and Router, only GET requests for general RSS queries, but has all four GET/PUT/POST/DELETE in meaningful contexts for user and database management

### Usage:
Go ahead and fire up Postman because Postman, without question, is by far the best frontend known to man. I won't fully document all of the possible REST routes here (extremely detailed documentation can be found by scrolling through the comments in the `routes/` folder), but a quick summary is as follows:
* Try a GET on the regular path `/` to see that the server is indeed working, and check out `/all`.
* Poke around with GET on paths such as `/category/news` and `/author/{someone's name}`.
* Use the *request body* to GET on several authors or categories at once through `/category/` and `/author/`.
* Poke around with GET/PUT/POST/DELETE around the `/user/` path; this path is handled by a different express router.
* Try logging in by passing in "Username" and "Password" in every *request body* you send when using the `/user/` path. I've already added a user called "testingUser" with password "password", but feel free to add more by calling a POST on `/user/` with a new "Username", "Password" JSON.
* To see your profile, call a GET on `/user/`. Make sure to keep your username and password in the request body. I haven't implemented sessions in this server and you sadly need to provide login info every time.
* To add your favorite authors and categories, call a few POST requests on `/user/author` or `/user/category` to insert a "NewAuthor" or "NewCategory".
* **Here's the fun part: after adding any authors/categories, you can GET `/user/feed/` for an automatically formatted query that will return all your favorite content in one request. You can also selectively do this for `/user/author/` or `/user/category`.
* To delete any favorites, call DELETE requests instead.
* To change your password, call PUT on `/user/`. See the comments for more details.
* To delete your account (how could you!), call DELETE on `/user/`.

### Example Usage:

![postman pic](https://i.imgur.com/xYuKmn5.png)


### Have fun being deeply educated by only your favorite posts on The Dartmouth's RSS feed!

### Note to DALI: This is sort of a hybrid of the API and Backend challenges. Since it doesn't really fit into either one of those, I'm going to attach my old website as well to check off the box for doing a coding challenge. However, I would like to be evaluated by my work here first and foremost.
