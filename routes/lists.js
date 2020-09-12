var express = require('express');
const { rawListeners } = require('../app');
const passport    = require('passport');
var router = express.Router();
var Twit = require('twit');

router.get('/',
    ensureAuthenticated,
    function(req, res) {
        var T = new Twit({
            consumer_key:         process.env.TWITTER_CONSUMER_KEY,
            consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
            access_token:         req.user.accessToken,
            access_token_secret:  req.user.tokenSecret,
            timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
            strictSSL:            true,     // optional - requires SSL certificates to be valid.
          })

        T.get('lists/list', {}, function (err, data, response) {
            res.json(data);
        })
    });


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

module.exports = router;