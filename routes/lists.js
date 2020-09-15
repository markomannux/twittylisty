var express = require('express');
const { rawListeners } = require('../app');
const passport    = require('passport');
var router = express.Router();
var buildTwitClient = require('../helpers/twit-helper').buildTwitClient;
var ensureAuthenticated = require('../helpers/auth-helper').ensureAuthenticated;

router.get('/',
    ensureAuthenticated,
    function(req, res) {
        var T = buildTwitClient(req);

        T.get('lists/list', {}, function (err, data, response) {
            if(err) {
                console.log(err);
            }
            console.log(data)
            res.render('lists/lists', {
                title: 'Lists',
                user: req.user,
                lists: data
            });
        })
    });

router.get('/:id',
    ensureAuthenticated,
    function(req, res) {
        var T = buildTwitClient(req);

        T.get('lists/members', {list_id: req.params.id, include_entities: false}, function (err, data, response) {
            if (err) {
                console.log(err.stack);
                res.send(err.message);
            }

            res.render('lists/members', {
                title: 'Members',
                user: req.user,
                members: data
            });
        })
    });

module.exports = router;