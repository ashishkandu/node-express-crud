import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Item } from "./models/items.js";

import { username, password, host } from "./secrets.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.urlencoded({ extended: true }));

const mongodb = `mongodb+srv://${username}:${password}@${host}/item-database?retryWrites=true&w=majority`;
const port = 3000;

mongoose.connect(mongodb)
    .then(() => {
        console.log("Successfully connected to the database");
        app.listen(port, () => {
            console.log(`Listening on port ${port}`)
        });
    }).catch( err => {
        console.log("Could not connect to database", err);
        process.exit();
    });

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/get-items')
});


app.get('/get-items', (req, res) => {
    Item.find().then(result=>{
        res.render('index', {items: result})
    }).catch(err => console.log(err));
})

app.get('/add-item', (req, res) => {
    res.render('add-item');
});

app.post('/items', (req, res) => {
    const item = Item(req.body);
    item.save().then(() => {
        res.redirect('/get-items')
    }).catch( err => console.log(err));
});

app.get('/items/:id', (req, res) => {
    const id = req.params.id;
    Item.findById(id).then(result => {
        res.render('item-detail', {item:result});
    })
})

app.delete('/items/:id', (req, res) => {
    const id = req.params.id;
    Item.findByIdAndDelete(id).then(result => {
        res.json({redirect: '/get-items'})
    });
})

app.put('/items/:id', (req, res) => {
    const id = req.params.id;
    Item.findByIdAndUpdate(id, req.body).then(result => {
        res.json({msg:'Updated successfully'})
    });
})

app.use((req, res) => {
    res.render('404');
});