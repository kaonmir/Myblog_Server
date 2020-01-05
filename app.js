'use strict';
const express = require('express');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const fs = require('fs');
const option = JSON.parse(fs.readFileSync('db_info.json'));
const db = mysql.createConnection(option);
db.connect();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/pinned', (req, res) => {
    db.query(`SELECT * FROM themes WHERE category='${req.query.category}' AND pinned=1`, (error, results) => {
        if (error) throw (error);
        else {
            res.send(results);
            res.end();
        }
    })

});
app.get('/themes', (req, res) => {
    db.query(`SELECT id, title, pinned from themes WHERE category='${req.query.category}'`, (error, results) => {
        if (error) throw (error);
        else {
            res.send(results);
            res.end();
        }
    });
});
app.post('/themes/edit', (req, res) => {
    let str = req.body.pinnedItem;
    var items = new Array();

    if (str == undefined) items.push(-999);
    else items = new Array(str);

    db.query(`UPDATE themes SET pinned=1 WHERE id IN (${items.toString()})`);
    db.query(`UPDATE themes SET pinned=0 WHERE id NOT IN (${items.toString()}) AND category='${req.query.category}'`);

    res.end();
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hidden = req.body.hidden;

    if (hidden != undefined) {
        const created_date = new Date(hidden.created_date);
        const current_date = new Date();

        if (Math.abs(current_date - created_date) < 100 * 60 * 1000) { // 단위: ms, 100분 제한
            db.query(`SELECT * FROM users WHERE username='${hidden.username}' AND hidden=${hidden.hidden}`, (error, results) => {
                if (error) throw (error);
                else if (results.length == 1) {
                    console.log("login successfully");
                    res.json({ result: true });
                }
            })
        }
    }
    else {
        db.query(`SELECT * FROM users WHERE username='${username}' AND password='${password}'`, (error, results) => {
            if (error) throw (error);
            else {
                if (results.length == 1) {
                    let result = results[0];
                    const hidden = parseInt(Math.random() * 2e9);
                    res.json({ result: true, hidden: hidden });
                    db.query(`UPDATE users SET hidden=${hidden} WHERE username='${username}'`);
                }
                else {
                    res.json({ result: false });
                }
            }
        });
    }
})


app.listen(4000, () => {
    console.log("Express server has started on port 4000");
});