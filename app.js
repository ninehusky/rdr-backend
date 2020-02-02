// An API that'll hopefully be used with Rainy Dawg Radio's website!

require("dotenv").config();

const express = require("express");
const app = express();
const fetch = require("node-fetch");

const Twitter = require("twitter-node-client").Twitter;

const TWITTER_CONFIG_INFO = {
        "consumerKey": process.env.CONSUMER_KEY, 
        "consumerSecret": process.env.CONSUMER_SECRET,
        "accessToken": process.env.ACCESS_TOKEN,
        "accessTokenSecret": process.env.ACCESS_TOKEN_SECRET,
        "callBackUrl": process.env.CALLBACK_URL
}

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/getTweets", (req, res) => {
			getTweets(req, res);
});

app.get("/getTumblrInfo", (req, res) => {
		getTumblrInfo(req, res);
});

// Sends JSON containing tumblr information.
// Tbh I'm not entirely sure of the logistics of this, but
// this seems to be a better way of handling things.
function getTumblrInfo(req, res) {
    	const baseURL = "https://api.tumblr.com/v2/blog/";
    	const identifier = "rainydawgradioblog.tumblr.com/";
    	const method = "posts";
    	const api_key = process.env.TUMBLR_API_KEY; // slightly safer haha 
		fetch(baseURL + identifier + method + "?api_key=" + api_key)
		 	.then(response => response.json())
			.then(response => res.json(response))
			.catch(console.error);
}


function error(err, response, body) {
		console.error(err);
}

// Sends JSON object of the form:
// "success": <array containing objs of the form {"name": <username>, "tweet": <tweet>}
// Sends 400 error if name not given
function getTweets(req, res) {
		let name = req.query.name;
		if (!name) {
				res.status(400);
				return res.json({"error": "name parameter not supplied!"});
		}
		let twitter = new Twitter(TWITTER_CONFIG_INFO);
		twitter.getUserTimeline({ screen_name: name}, error, (tweetJSON) => {
				let tweetArray = Array();
				tweetJSON = JSON.parse(tweetJSON);
				for (tweet of tweetJSON) {
						if (tweet["user"]["screen_name"] === name) {
								tweetArray.push({"name": name,
												 "tweet": tweet["text"]
								});
					}
				}
				res.status(200);
				return res.json({"success": tweetArray});
		});
}

app.listen(process.env.PORT, () => console.log(`Example app listening on process.env.PORT ${process.env.PORT}!`))
