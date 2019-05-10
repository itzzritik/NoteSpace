const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const clear = require('clear');
const git = require('simple-git/promise')();
const ran = require("randomstring");
const ip = require("ip");

var call = 0,
    loader = function(msg) {
        var x=0,load = ["⠁ ","⠈ "," ⠁"," ⠈"," ⠐"," ⠠"," ⢀"," ⡀","⢀ ","⡀ ","⠄ ","⠂ "];//"⠁⠂⠄⡀⢀⠠⠐⠈";
        return setInterval(function() {
            process.stdout.write("\r" + load[x=(++x<load.length)?x:0]+" "+msg);
        }, 50);
    },
    load,mongoCall=0;

app.set("view engine", "ejs");
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));

const dbOptions = { useNewUrlParser: true,useFindAndModify: false, reconnectTries: Number.MAX_VALUE, poolSize: 10 };
var mongoConnect = function(callback) {
    mongoose.connect(require("./mongo"), dbOptions).then(
        () => { 
            clearInterval(load);
            console.log("\r>  Connection Established"); 
        },
        e => { 
            clearInterval(load);
            if(++mongoCall > 1)process.stdout.write("\033[A\33[2K\r"); 
            console.log("\r>  Connection Failed - " + e.code +" "+ ((mongoCall>1)?"("+mongoCall+")":"")); 
            load=loader("  Reconnecting"); 
            setTimeout(mongoConnect,10000);
        }
    ).catch((error) => {
        assert.isNotOk(error,'Promise error');
    });;
};
mongoConnect();

app.use(bodyparser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var notes = new mongoose.Schema({
    id: String,
    title: String,
    color: String,
    type: String,
    content: String,
});
var NoteSpace = mongoose.model("notespace", new mongoose.Schema({
    token : String,
    notebook: [notes]
}));
app.get("/test", function(req, res) {
    var token = req.query.token,
        updates = req.query.updates;
    console.log("\n" + ++call + ") User Data Requested  ( Token : "+token+" )");

    NoteSpace.find({ token: token }, function(e, data) {
        if (e) { clearInterval(load);console.log("\r>  Error occured :\n>  " + e);res.send("0"); }
        else {
            if (data.length) {
                updates.forEach(function (note) {
                    var set = {};
                    if(note.title != null) set['notebook.$.title'] = note.title;
                    if(note.color != null) set['notebook.$.color'] = note.color;
                    if(note.type != null) set['notebook.$.type'] = note.type;
                    if(note.content != null) set['notebook.$.content'] = note.content;
                    console.log(JSON.stringify(set, null, 4));
                    NoteSpace.updateOne({ token: token, 'notebook.id': note.id }, {$set: set},
                    function(err, user) {
                        clearInterval(load);
                        if (err) {
                            console.log("\r>  Error While Saving Changes" + err);
                            res.send("0");
                        }
                        else {
                            console.log("\r>  Notespace Sucessfully Updated");
                            //res.send("1");
                        }
                    });
                });
                res.send("1");
            }
            else {
                NoteSpace.create({
                    token   : token,
                    notebook: updates
                }, function(e, user) {
                    clearInterval(load);
                    if (e) {
                        res.send("0");
                        console.log("\r>  Error While Creating New Notespace\n>  " + e);
                    }
                    else {
                        res.send("1");
                        console.log("\r>  Notespace Sucessfully Created");
                    }
                });
            }
        }
    });
});


app.get("/git", function(req, res) {
    var m = req.query.m;
    console.log("\n" + ++call + ") Pushing to Github");
    git.add('.')
        .then(
            (addSuccess) => {
                console.log(">  Changes Successfully Added to Stack");
            }, (failedAdd) => {
                console.log(">  Changes Adding Failed\n>  " + failedAdd);
            });
    git.commit(m)
        .then(
            (successCommit) => {
                console.log(">  Changes Successfully Commited\n   >  Message : \"" + m + "\"");
            }, (failed) => {
                console.log(">  Changes Commit Failed\n>  " + failed);
            });
    git.push('origin', 'master')
        .then((success) => {
            console.log(">  Changes Successfully Pushed to Origin Master");
        }, (failed) => {
            console.log(">  Changes Push Failed\n>  " + failed);
        });
    res.send("1");
});

app.post("/save", function(req, res) {
    var token   = req.body.token,
        updates = req.body.updates;
    console.log("\n" + ++call + ") User Data Requested  ( Token : "+token+" )");
    console.log(JSON.stringify(updates, null, 4));
    NoteSpace.find({ token: token }, function(e, data) {
        if (e) { clearInterval(load);console.log("\r>  Error occured :\n>  " + e);res.send("0"); }
        else {
            if (data.length) {
                updates.forEach(function (note) {
                    var set = {};
                    if(note.title != null) set['notebook.$.title'] = note.title;
                    if(note.color != null) set['notebook.$.color'] = note.color;
                    if(note.type != null) set['notebook.$.type'] = note.type;
                    if(note.content != null) set['notebook.$.content'] = note.content;
                    console.log(JSON.stringify(set, null, 4));
                    NoteSpace.updateOne({ token: token, 'notebook.id': note.id }, {$set: set},
                    function(err, user) {
                        clearInterval(load);
                        if (err) {
                            console.log("\r>  Error While Saving Changes" + err);
                            res.send("0");
                        }
                        else {
                            console.log("\r>  Notespace Sucessfully Updated");
                            //res.send("1");
                        }
                    });
                });
                res.send("1");
            }
            else {
                NoteSpace.create({
                    token   : token,
                    notebook: updates
                }, function(e, user) {
                    clearInterval(load);
                    if (e) {
                        res.send("0");
                        console.log("\r>  Error While Creating New Notespace\n>  " + e);
                    }
                    else {
                        res.send("1");
                        console.log("\r>  Notespace Sucessfully Created");
                    }
                });
            }
        }
    });
});

app.post("/getData", function(req, res) {
    var token= req.body.token;
    console.log("\n" + ++call + ") User Data Requested  ( Token : "+req.body.token+" )");
    NoteSpace.find({ token: token }, function(e, notes) {
        if (e) { console.log(">  Error occured :\n>  " + e); }
        else {
            res.json(notes[0]);
            console.log("  > Fetched and sent successfully");
        }
    });
});

app.get("/*", function(req, res) {
    var token = (req.originalUrl).substring(1, (req.originalUrl).length);
    if(token != token.toLowerCase()) res.redirect(token.toLowerCase());
    if (token.length == 0) {
        var id = "";
        var unique = (id) => {
            try {
                NoteSpace.find({ token: id }, function(e, token) {
                    if (e) { console.log(">  Error occured :\n>  " + e); }
                    else {
                        if (token.length) return true;
                        else return false;
                    }
                });
            }
            catch (err) {
                console.log(err);
                return false;
            }
        };
        do {
            id = ran.generate({
                length: 8,
                capitalization: 'lowercase',
                charset: 'alphabetic'
            });
        } while (unique(id));
        res.redirect(id);
    }
    else
        res.render("index");
});

app.listen(process.env.PORT || 8080, function() {
    clear();
    console.log("\n" + ++call + ") Starting Server");
    console.log(">  Server is running at http://" + (process.env.IP || ip.address() || "localhost") + ":" + (process.env.PORT || "8080"));
    console.log("\n" + ++call + ") Connection to MongoDB Atlas Server");
    load = loader(" ".repeat(34));
});
