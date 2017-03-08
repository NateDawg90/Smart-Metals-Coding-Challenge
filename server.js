// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/smartmetals'); // connect to our database

var Comment     = require('./app/models/comment');

var comment = new Comment();      // create a new instance of the Comment model
comment.body = "This is the body!";  // set the comments body (comes from the request)
// save the comment and check for errors
console.log(comment);
comment.save(function(err, comment) {
  console.log(err);
  console.log(comment);
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
router.route('/comments')

    // create a comment (accessed at POST http://localhost:8080/api/comments)
    .post(function(req, res) {

        var comment = new Comment();      // create a new instance of the Comment model
        comment.body = req.body.body;  // set the comments body (comes from the request)
        // save the comment and check for errors
        comment.save(function(err) {
            if (err) {
              res.send(err);
            }

            res.json({ message: 'Comment created!' });
        });

    })

    // get all the comments (accessed at GET http://localhost:8080/api/comments)
    .get(function(req, res) {
        Comment.find(function(err, comments) {
            if (err)
                res.send(err);

            res.json(comments);
        });
    });

// on routes that end in /comments/:comment_id
// ----------------------------------------------------
router.route('/comments/:comment_id')

    // get the comment with that id (accessed at GET http://localhost:8080/api/comments/:comment_id)
    .get(function(req, res) {
        Comment.findById(req.params.comment_id, function(err, comment) {
            if (err)
                res.send(err);
            res.json(comment);
        });
    })

    // update the comment with this id (accessed at PUT http://localhost:8080/api/comments/:comment_id)
    .put(function(req, res) {

        // use our comment model to find the comment we want
        Comment.findById(req.params.comment_id, function(err, comment) {

            if (err)
                res.send(err);

            comment.body = req.body.body;  // update the comments body

            // save the comment
            comment.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Comment updated!' });
            });

        });
    })

    // delete the comment with this id (accessed at DELETE http://localhost:8080/api/comments/:comment_id)
    .delete(function(req, res) {
        let ids = req.params.comment_id.split("+");
        for (let i = 0; i < ids.length; i++) {
          Comment.remove({
              _id: ids[i]
          }, function(err, comment) {
              if (err)
                  res.send(err);

              res.json({ message: 'Successfully deleted comment' });
          });
        }
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
