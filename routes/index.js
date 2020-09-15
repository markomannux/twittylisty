var express = require('express');
const { rawListeners } = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/lists');
    return;
  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
