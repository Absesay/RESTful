// require modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// server port
const PORT = process.env.PORT || 3000;

// new express object
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// connect mongoose database
const URL = "mongodb://localhost:27017/wikiDB";
mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});

// error handling
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("db connected");
});

// set schema
const articleSchema = {
    title: String,
    content: String
};

// set model
const Article = mongoose.model("Article", articleSchema);

// general request
app.route("/articles")
    .get((req, res)=> {
        Article.find((err, foundArticles) => {
        if(!err) {
            res.send(foundArticles);
            console.log(foundArticles);
            
            }
            else {
                res.send(err);
            }
        });
    })
    .post((req, res)=> {
    // save in db
    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save((err) => {
        if(err) res.send(err)
        else res.send("sucess");
    });
    
    })
    .delete((req, res) => {
        Article.deleteMany((err)=> {
                if(err) res.send(err);
                else res.send("success deleted all");
            })
    });


// specific article

app.route("/articles/:articleTitle")
    .get((req, res) => {
        Article.findOne({title: req.params.articleTitle}, (err, item) => {
            if(err) res.send("No article found");
            else res.send(item);
        });
    })
    .put((req, res) => {
        Article.update(
            {title: req.params.articleTitle},
            {title: req.body.title, content: req.body.content}, 
            {overwrite:true}, 
            (err, results)=>{
                if(err) res.send("recorde not found");
                else res.send(results);
            }
        );
    })
    .patch((req, res)=> {
        Article.updateOne(
            {title: req.params.articleTitle},
            {$set: req.body},
            (err, results)=>{
                if(err) res.send("recorde not found");
                else res.send(results);
            }
        );
    })
    .delete((req, res) => {
        Article.deleteOne(
            {title: req.params.articleTitle},
            (err, results)=> {
                if(err) res.send("recorde not found");
                else res.send(results);
            }
        );
    });

// spin up server 
app.listen(PORT, () => console.log(`Server at ${PORT}`))


