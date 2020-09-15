var Twit = require('twit');

function buildTwitClient(req) {
    return new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: req.user.accessToken,
        access_token_secret: req.user.tokenSecret,
        timeout_ms: 60 * 1000,
        strictSSL: true,
    });
}

module.exports = {
    buildTwitClient
}