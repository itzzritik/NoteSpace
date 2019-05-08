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

const dbOptions = { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, poolSize: 10 };
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

var Token = mongoose.model("token", new mongoose.Schema({
    token: String,
    notes: Array
}));

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
    var token = req.body.token;
    var notes = req.body.notes;
    Token.find({ token: path }, function(e, token) {
        if (e) { console.log(">  Error occured :\n>  " + e); }
        else {
            if (token.length) {
                Token.findOneAndUpdate({ token: path }, {
                        $set: {
                            token: path,
                            value: value
                        }
                    },
                    function(err, user) {
                        if (err) {
                            console.log(">  Error While Saving Changes" + err);
                            res.send("0");
                        }
                        else {
                            res.send("1");
                        }
                    });
            }
            else {
                Token.create({
                    token: path,
                    value: value
                }, function(e, user) {
                    if (e) {
                        res.send("0");
                        console.log(">  Error While Creating New Notespace\n>  " + e);
                    }
                    else {
                        res.send("1");
                    }
                });
            }
        }
    });
});

app.post("/getData", function(req, res) {
    var token= req.body.token;
    console.log("\n" + ++call + ") User Data Requested  ( Token : "+req.body.token+" )");
    Token.find({ token: token }, function(e, token) {
        if (e) { console.log(">  Error occured :\n>  " + e); }
        else {
            res.json(token);
            console.log("  > Fetched and sent successfully");
        }
    });
});
app.get("/*", function(req, res) {
    var path = (req.originalUrl).substring(1, (req.originalUrl).length);
    if (path.length == 0) {
        var id = "";
        var unique = (id) => {
            try {
                Token.find({ token: id }, function(e, token) {
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
            id = ran.generate(7);
        } while (unique(id));
        res.redirect(id);
    }
    else
        res.render("edit");
});

app.listen(process.env.PORT || 8080, function() {
    clear();
    console.log("\n" + ++call + ") Starting Server");
    console.log(">  Server is running at http://" + (process.env.IP || ip.address() || "localhost") + ":" + (process.env.PORT || "8080"));
    console.log("\n" + ++call + ") Connection to MongoDB Atlas Server");
    load = loader(" ".repeat(34));
});
