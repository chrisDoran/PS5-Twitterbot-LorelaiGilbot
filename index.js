var express = require('express');
var app = express();
var gilmoreScripts = require('./public/script-parser/most-of-season-1.json');
var ME = "Lorelai";
var Twitter = require('twitter');
require('./public/date.js');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var client = new Twitter({
  consumer_key: 'o7f6prPUS1dPXSI9nEbrwOuJi',
  consumer_secret: 'sUHj54Ezglq3A1ar2i9hxspAtBtBCuzIZV9rwyo6D43nSiY4pC',
  access_token_key: '777816362643132416-14UkjELykjtE3YoewHacxZauHc4YDaQ',
  access_token_secret: 'NNtFy9kSIcLE4NGqwEdMycvBYmpB4B7X7FZ5O6Frh0vjJ'
});

function init(){
	doTwitter();
};

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function doTwitter(){

	var lorelaiTweets = [];
	var allMentions = [];
	var newMentions = [];

	var params = {screen_name: 'LorelaiGilbot'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			lorelaiTweets = tweets;
			console.log("Got " + lorelaiTweets.length + " lorelaiTweets")
			console.log(lorelaiTweets);
			client.get('search/tweets', {q: '@LorelaiGilbot', count: 50}, function(error, tweets, response) {
				allMentions = tweets.statuses;

				if (!error) {
					console.log("Got " + allMentions.length + " mentions");
					// console.log(tweets);
					console.log("unicorn");
					if(allMentions.length > 0){

						var lorelaiTimestamp = 0;
						for(var i = 0; i < lorelaiTweets.length; i++){
							if(getTimestamp(lorelaiTweets[i]) > lorelaiTimestamp){
								lorelaiTimestamp = getTimestamp(lorelaiTweets[i]);
							}
						}
						console.log("lorelai timestamp: " + lorelaiTimestamp);
						var newMentions = [];
						for(var i = 0; i < allMentions.length; i++){
							console.log("this timestamp: " + getTimestamp(allMentions[i]))
							if(getScreenName(allMentions[i]) != "LorelaiGilbot" && getTimestamp(allMentions[i]) > lorelaiTimestamp){
								console.log("^^^ was newer than Lorelai");
								newMentions.push(allMentions[i]);
							}
						}

						tweetText = "";
						console.log("Got " + newMentions.length + " new mentions");

						console.log(newMentions);
						if(newMentions.length > 2){
							console.log("whaleMan");
							tweetText = "Guys guys, slow down. I'm not a computer.";
							for(var i = 0; i < newMentions.length; i++){
								var screenName = getScreenName(newMentions[i]);
								if(tweetText.length + screenName.length > 140){
									tweetText = "Oh my god, too many people are talking to me!";
								} else {
									tweetText = "@" + getScreenName(newMentions[i]) + " " + tweetText ;
								}
							}
						} else if(newMentions.length > 0){
							for(var i = 0; i < newMentions.length; i++){
								console.log("shivers");
								makeDialogue(newMentions[i]);
								return;
							}
						} 
						if(tweetText.length > 0){
							console.log("gojira");
							sendTweet(tweetText);
						}
					} 

				} else {
					console.log(error);
				}
			});
			setTimeout(doTwitter, 30000);
		} else {
			console.log(error);
			setTimeout(doTwitter, 30000);
		}
	});

}

function makeDialogue(theirTweet){
	var tweetText = theirTweet.text.replace("@LorelaiGilbot ", "");
	tweetText = tweetText.trim();
	var ourTweet = "";

	var series = gilmoreScripts.series;
	console.log("say stuff");
	console.log("TweetText: " + tweetText);
	for(var i = 0; i < series.length; i++){
		var episode = series[i];
		var script = episode.script;
		for(var d = 0; d < script.length; d++){
			// console.log("dialoge: " + d);
			var dialogue = script[d];
			// console.log("dialogue: " + dialogue.text)
			if(dialogue.text == tweetText){
				console.log("found the line");
				if(dialogue.TYPE == "SE"){
					console.log("tweeted 1");
					return sendTweet("Reading the script is cheating");
				} else if(dialogue.TYPE == "SD"){
					console.log("tweeted 2");
					return sendTweet("Reading the script is cheating");
				} else if(dialogue.TYPE == "DI"){
					console.log("DI");
					if(dialogue.character == ME){
						console.log("its ME");
						return sendTweet("That sounds like something I would say...");
					} else {
						var nextDialogue = getNextDialogue(script, d);
						console.log("red panda");
						if(nextDialogue == null) {
							return sendTweet("I refuse to admit that we've made mistake.");
						} else if(nextDialogue.character != ME){
							console.log("Snoke");
							var theirScreenName = "@" + getScreenName(theirTweet);
							return sendTweet(theirScreenName + " I think you need to talk to " + nextDialogue.character);
						} else {
							console.log("Yaris");
							var ourLine = nextDialogue.text;
							var theirScreenName = "@" + getScreenName(theirTweet);

							if(ourLine.length + theirScreenName.length + 1 > 140){
								return sendLongTweet(theirScreenName, ourLine);
							} else {
								sendTweet(theirScreenName + " " + ourLine);
								console.log("sup");
								return;
							}
						}
					}
				} else {
					console.log("badsies");
				} 
			}
		} 
	}
	console.log("lightning");
}



function sendTweet(text){
	console.log("sending tweet: " + text);
	client.post('statuses/update', {status: text}, function(error, tweet, response) {
		console.log("Tried to send a tweet");
	});
};

function sendLongTweet(theirScreenName, text){
	var remain = text;
	var i = 1;
	while(remain.length > 0){
		var tweetText = remain.substring(0, 140 - theirScreenName.length - 1 - 4);
		remain = remain.substring(140 - theirScreenName.length - 1 - 4);
		sendTweet(theirScreenName + " " + i + ": " + tweetText);
		i++;
	}
}

function getScreenName(tweet){
	if(tweet != null && tweet.user){
		return tweet.user.screen_name;
	}
	return null;
}

function getTimestamp(tweet){
	var dateString = tweet.created_at;

	var dateNum = "";

	dateString = dateString.substring(4);
	var month = dateString.substring(0, 3);
	var day = dateString.substring(4, 6);
	var time = dateString.substring(7, 15);

	var monthNum;
	var timeNum;

	switch(month) {
		case "Jan":
			monthNum = 1;
			break;
		case "Feb":
			monthNum = 2;
			break;
		case "Mar":
			monthNum = 3;
			break;
		case "Apr":
			monthNum = 4;
			break;
		case "May":
			monthNum = 5;
			break;
		case "Jun":
			monthNum = 6;
			break;
		case "Jul":
			monthNum = 7;
			break;
		case "Aug":
			monthNum = 8;
			break;
		case "Sep":
			monthNum = 9;
			break;
		case "Oct":
			monthNum = 10;
			break;
		case "Nov":
			monthNum = 11;
			break;
		case "Dec":
			monthNum = 12;
			break;
	}
	timeNum = time.replace(":", "");
	timeNum = timeNum.replace(":", "");
	timeNum = timeNum.replace(":", "");

	var timestamp = monthNum.toString() + day.toString() + timeNum.toString();
	console.log(timestamp);
	return Number(timestamp);

}

function getNextDialogue(script, i){
	var nextDialogue = null;
	var n = i + 1;
	while(nextDialogue == null){
		if(script[n].TYPE == "DI"){
			nextDialogue = script[n];
		} else {
			n++;
		}
	}
	return nextDialogue;
}


init();



// function openStream(){
// 	var stream = client.stream('statuses/filter', {track: 'trump'});
// 	stream.on('data', function(event) {
// 		console.log("Got a tweet");
// 	  console.log(event && event.text);
// 	});
	 
// 	stream.on('error', function(error) {
// 	  console.log("got an error");
// 	  console.log(error);
// 	});
// };


// var params = {screen_name: 'nodejs'};
	// client.get('statuses/user_timeline', params, function(error, tweets, response) {
	// 	if (!error) {
	// 		console.log(tweets);
	// 	} else {
	// 		console.log(error);
	// 	}
	// });