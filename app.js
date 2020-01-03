'use strict';
var express = require('express');
var app = express();
var querystring = require('querystring');
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'myinstance.cvsejgvxoucu.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: '39tiwqow4j4!',
    database: 'Contents'
})
db.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/pinned', (req, res) => {
    db.query(`SELECT * FROM themes WHERE category='${req.query.category}' AND pinned=1`, (error, results) => {
        if (error) console.log(error);
        else {
            res.send(results);
            res.end();
        }
    })

});
app.get('/themes', (req, res) => {
    db.query(`SELECT id, title, pinned from themes WHERE category='${req.query.category}'`, (error, results) => {
        if (error) console.log(error);
        else {
            res.send(results);
            res.end();
        }
    });
});
app.post('/themes/edit', (req, res) => {
    let str = req.body.pinnedItem;
    var items = new Array();

    console.log(str);

    if (str == undefined) items.push(-999);
    else items = new Array(str);

    db.query(`UPDATE themes SET pinned=1 WHERE id IN (${items.toString()})`);
    db.query(`UPDATE themes SET pinned=0 WHERE id NOT IN (${items.toString()}) AND category='${req.query.category}'`);

    res.end();
});

app.listen(4000, () => {
    console.log("Express server has started on port 4000");
});