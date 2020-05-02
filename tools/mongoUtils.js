require('dotenv').config();
let loading, mongoCall = 0;
const mongoose = require('mongoose'),
    chalk = require('chalk'),
    logger = require('./logger'),
    NoteSpace = require('../models/notespace.js'),

    get = (token, cb) => {
        NoteSpace.find({ token }, function(err, notes) {
            if (err) return cb(err);
            else return cb(null, notes[0]);
        });
    },

    update = (token, updates, cb) => {
        NoteSpace.find({ token }, function(err, result) {
            if (err) return cb(err);
            else {
                if (result.length) {
                    updates.forEach((note) => {
                        let set = {},
                            exists = false,
                            updateSet;

                        (result[0].notebook).forEach((check) => {
                            if(check.id == note.id){
                                exists = true;
                                return;
                            }
                        });
                        if(exists) {
                            exists = { token: token, 'notebook.id': note.id };
                            if(note.id != null) set['notebook.$.id'] = note.id;
                            if(note.title != null) set['notebook.$.title'] = note.title;
                            if(note.color != null) set['notebook.$.color'] = note.color;
                            if(note.type != null) set['notebook.$.type'] = note.type;
                            if(note.content != null) set['notebook.$.content'] = note.content;
                            updateSet={$set: set};
                        }
                        else {
                            exists = { token };
                            updateSet = { $push: { 'notebook': note }};
                        }
                        NoteSpace.updateOne(exists, updateSet, (err) => {
                            if (err) return cb(err);
                            else return cb(null, updates)
                        });
                    });
                }
                else {
                    NoteSpace.create({
                        token   : token,
                        notebook: updates
                    }, function(err) {
                        if (err) return cb(err);
                        else return cb(null, updates)
                    });
                }
            }
        });
    },

    consoleLoader = (msg) => {
        let x = 0, 
            load = ['⠁ ', '⠈ ', ' ⠁', ' ⠈', ' ⠐', ' ⠠', ' ⢀', ' ⡀', '⢀ ', '⡀ ', '⠄ ', '⠂ '];
        return setInterval(() => {
            logger.stdout('\r' + load[x = (++x < load.length) ? x : 0] + ' ' + msg);
        }, 50);
    },

    dbOptions = { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, poolSize: 10 },
    mongoConnect = (callback) => {
        loading = consoleLoader(' '.repeat(34));
        mongoose.connect(process.env.MONGO_KEY, dbOptions).then(
            () => {
                clearInterval(loading);
                logger.stdout('\r');
                logger.log(false, 'Connection Established');
                callback();
            }
        ).catch((e) => {
            clearInterval(loading);
            ++mongoCall > 1 && logger.stdout('\033[A\33[2K\r');

            logger.stdout('\r');
            logger.error(false, 'Connection Failed: ', chalk.red(e), chalk.red.dim((mongoCall > 1) ? '(' + mongoCall + ')' : ''));
            loading = consoleLoader('  Reconnecting');
            setTimeout(mongoConnect, 10000);
        });
    },
    
    connect = (callback) => {
        logger.log(true, 'Connecting to MongoDB Atlas Server');
        mongoConnect(() => {
            callback();
        });
    };

module.exports = { consoleLoader, connect, get, update };