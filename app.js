const express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    bodyparser = require('body-parser'),
    mongoose = require('mongoose'),
    ran = require('randomstring'),
    ip = require('ip'),
    chalk = require('chalk'),
    socketIO = require('socket.io'),
    io = socketIO(server);

    mongoUtils = require('./tools/mongoUtils'),
    logger = require('./tools/logger'),
    socketUtils = require('./tools/socketUtils'),
    crypto = require('./tools/crypto'),

    NoteSpace = require('./models/notespace.js');

require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/:token', function(req, res) {
    let token = req.params.token;
    if (token != token.toLowerCase()) res.redirect(token.toLowerCase());
    res.render('index');
});

app.get('/', function(req, res) {
    let token = '',
        unique = (token) => {
            NoteSpace.find({ token }, function(err, tokens) {
                if (err) logger.error(false, 'Error occurred while `find` action in mongoose:', err);

                if (tokens.length) return true;
                else return false;
            });
        };

    do token = ran.generate({ length: 5, capitalization: 'lowercase', charset: 'alphabetic' });
    while (unique(token));

    res.redirect(token);
});

server.listen(env.PORT || 8080, function() {
    logger.clear();
    logger.log(true, 'Starting Server');
    logger.log(false, 'Server is running at', 
        chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
	
	mongoUtils.connect(() => {
		socketUtils.initialize(io);
	});
});
