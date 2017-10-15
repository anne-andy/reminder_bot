
var Twit = require('twit');
var Excel = require('exceljs');

var bot = new Twit({
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	access_token: process.env.access_token,
	access_token_secret:  process.env.access_token_secret,
	timeout_ms: 60*1000
});

//read from excel file and print contents

var workbook = new Excel.Workbook();
var worksheet;
var reminders = [];
var reminder = {};

var columnType = {
	time: 1,
	monday: 2,
	tuesday: 3,
	wednesday: 4,
	thursday: 5,
	friday: 6,
	saturday: 7,
	sunday: 8
}

workbook.xlsx.readFile('weekly.xlsx')
    .then(function() {

        	worksheet = workbook.getWorksheet('Sheet1');
        	worksheet.eachRow(function(row, rowNumber) {

        		//if row is not the column headers

        		if (rowNumber > 1) {

	        		var date = new Date(row.values[columnType.time]);

	        		row.eachCell(function(cell, columnNumber) {

	        			//if column is after the time column

	        			if (columnNumber > columnType.time) {

	        				reminder = {};

	        				reminder.time = (date.getHours()) + ":" + date.getMinutes();

		        			if (columnNumber > columnType.time) {
		        				reminder.day = columnNumber - 1;
		        				reminder.task = cell.value;
		        			}

		        			reminders.push(reminder);

	        			}

	        		});
        		}

        	});

        	setInterval(function() {
        		tweetReminder();
        	}, 60*1000); //change it to every 30 minutes, except for testing

    });

function tweetStatus(statusText) {
	bot.post('statuses/update', {status: statusText}, function(err, data, response) {
		if (err) console.log(err);
		else console.log(statusText + ' status posted.');
	});
}

function sendMessage(messageText) {
	console.log('Sending message.');
	bot.post('direct_messages/new', {screen_name: 'ifelsewhen', text: messageText}, 
			function(err, data, response) {
				if (err) {
					console.log(err);
				} else {
					console.log(messageText + " sent.");
				}
			}
	);
}

//loops through array of reminder objects

function tweetReminder() {

	var oldDate = new Date();

	var localOffset = -(oldDate.getTimezoneOffset()/60);
	var destOffset = -4;
	var offset = destOffset - localOffset;

	var date = new Date(new Date().getTime() + offset * 3600 * 1000);

	var time = date.getHours() + ':' + date.getMinutes();
	var day = date.getDay();

	console.log('Checking for task on day ' + day + " at " + time + ".");

	reminders.forEach(function(reminder) {
		if (day == reminder.day && time == reminder.time) {
			sendMessage(reminder.task);
		} 
	});
}

// tweet at certain intervals

function statusUpdateIntervals(){
    bot.post('statuses/update', {status: 'another test...'}, function(err, data, response){
        if (err){
            console.log(err);
        }else{
            console.log('Bot posted');
        }
    });
}

setInterval(function(){ 
  //littleTweet(); 
}, 1000*60*10); //milliseconds*seconds*minutes

//reply to status

function statusReply() {
	bot.post('statuses/update', {status: 'test post', in_reply_to_status_id: '916121511961989120'}, 
		function(err, data, response)
		{
			if (err) {
				console.log("Bummer, there's an error: " + err);
			} else {
				console.log(data);
				console.log(data.text + " was tweeted.");
			}
		}
	);
}

//delete status

function deleteStatus() {
	bot.post('statuses/destroy/:id', {id: '914511107146108928'}, function(err, data, response){
		if (err) {
			console.log("Bummer, couldn't delete tweet: " + err);
		} else {

			console.log(data.text + " was deleted.");
		}
	});
}

//view followers

function viewFollowers() {
	bot.get('friends/list', {screen_name: 'Anne Andy'}, function(err, data, response){
		if (err) {
			console.log(err);
		} else {
			console.log(data);
			// data.users.forEach(function(user) {
			// 	console.log(user.screen_name);
			// })
			//console.log(data);
		}
	});
}

//get timeline

function getTimeline() {
	bot.get('statuses/home_timeline', {count: 1000},
		function (err, data, response) {
			if (err) {
				console.log(err);
			} else {
				data.forEach(function(d){
					//console.log(d.text);
					console.log(d.id_str);
					likePost(d.id_str);
					//console.log('\n');
				});
			}
		}
	);
}

//retweet a post

function retweetStatus() {

	bot.post('statuses/retweet/:id', {id: idString}, 
		function(err, data, response) {
			if (err) {
				console.log(err);
			} else {
				data.forEach(function(d){
					console.log(d.text + ' has been retweeted.');
				});
			}
		}
	);

}

//like a post

function likePost(idString) {

	bot.post('favorites/create', {id: idString}, 
		function(err, data, response) {
			if (err) {
				console.log(err);	
			} else {
				console.log(data.text + ' was liked.');
			}
	});

}

//Resouces:
//https://github.com/motdotla/dotenv
//https://www.twilio.com/blog/2017/08/working-with-environment-variables-in-node-js.html
