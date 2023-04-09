const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const requireLogin = require('../middleware/requireLogin')

//get all post
router.get('/allpost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('postedby', '_id name')
            .sort('-date');
        res.json({ posts });
    } catch (err) {
        console.log(err);
    }
});

//get data of user logged in
router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedby", "_id name")
        .then(mypost => {
            res.json({ mypost })
        })
        .catch(error => {
            console.log(error);
        })
})

//create post
router.post("/createpost", requireLogin, (req, res) => {
    const { title, body, pic } = req.body
    if (!title || !body || !pic) {
        res.status(422).json({ error: "please add all the fields" })
    }
    // console.log(req.user);
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo: pic,
        postedby: req.user
    })
    post.save()
        .then(result => {
            res.json({ post: result })
        })
        .catch(error => {
            console.log(error);
        })
})



module.exports = router