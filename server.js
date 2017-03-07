var dotenv = require('dotenv');
var express = require('express');
var app = express();

//var appurl = "https://fcc-project-hwun.c9users.io/";
var appurl = "https://fcc-shortenurl.herokuapp.com/";


var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.

var tempdoc = {
  original_url: "http://www.yahoo.com",
  short_url: "321"
};

dotenv.config();
var url = process.env.MONGOLAB_URI;
//var url;

function addMap(newDoc) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      var collection = db.collection('mapurl');
      collection.insert(newDoc, function(err, data) {
        if (err) return console.error(err);

        console.log(JSON.stringify(tempdoc));
      });
      db.close();
    }
  });
}

//addMap(tempdoc);

function makeStr() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var randomURL = makeStr();

function makeURL() {
  randomURL = makeStr();
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.error(err);
    }
    else {
      while (db.collection('mapurl').find({
          short_url: randomURL
        }).toArray[0]) {
        randomURL = makeStr();
      }
      db.close();
    }
  });
}

// receive a short URL, check if exist, then redirect
app.get('/:origurl', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log("input url is: " + req.params.origurl);

      db.collection('mapurl').find({
        short_url: appurl + req.params.origurl
      }).toArray(function(err, document) {
        if (err) return console.error("some error??: " + err);

        if (document[0]) {
          res.redirect(document[0].original_url);
        }
        else {
          res.send("Error: short URL not found");
        }
      });
      db.close();
    }
  });
});

// receive long url, check if exist, if exist then spit short url, else create new
app.get('/http://:origurl', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('URL received', req.params.origurl);

      //check if in db
      db.collection('mapurl').find({
        original_url: "http://" + req.params.origurl
      }).toArray(function(err, document) {
        if (err) return console.err(err);

        if (document[0]) {
          res.send(JSON.stringify(document[0]));
        }
        else {
          //add
          makeURL();
          tempdoc = {
            original_url: "http://" + req.params.origurl,
            short_url: appurl + randomURL
          };
          addMap(tempdoc);
          res.send(JSON.stringify(tempdoc));
        }
      });

      db.close();
    }
  });
});

app.get('/https://:origurl', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('URL received', req.params.origurl);

      //check if in db
      db.collection('mapurl').find({
        original_url: "https://" + req.params.origurl
      }).toArray(function(err, document) {
        if (err) return console.err(err);

        if (document[0]) {
          res.send(JSON.stringify(document[0]));
        }
        else {
          //add
          makeURL();
          tempdoc = {
            original_url: "https://" + req.params.origurl,
            short_url: appurl + randomURL
          };
          addMap(tempdoc);
          res.send(JSON.stringify(tempdoc));
        }
      });

      db.close();
    }
  });
});

app.get('*', function(req, res) {
  res.send("Error: Your input is not captured.  Check again.");
});

app.listen(process.env.PORT);

/*
app.listen(8080, function() {
  console.log('Example app listening');
});
*/