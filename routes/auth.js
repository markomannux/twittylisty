var express = require('express');
const { rawListeners } = require('../app');
const passport    = require('passport');
var router = express.Router();
const ensureAuthenticated = require('../helpers/auth-helper').ensureAuthenticated;

router.get('/login/twitter',
  passport.authenticate('twitter'));

router.get('/oauth/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/lists');
  });

router.get('/profile',
  ensureAuthenticated,
  function(req, res){
    res.render('profile', {title: 'Profile', user: req.user });
  });

router.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });
  
module.exports = router;