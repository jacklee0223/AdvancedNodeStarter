const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const redis = require('redis');
const util = require('util');

const Blog = mongoose.model('Blog');

const redisUrl = process.env['REDIS_URL'];
const client = redis.createClient(redisUrl);

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    client.get = util.promisify(client.get);
    // Do we have any cached data in redis related to this query
    const cachedBlogs = await client.get(req.user.id);

    // If yes, then respond to the request right away and return
    if (cachedBlogs) {
      return res.send(JSON.parse(cachedBlogs));
    }
    // If no, we need to respond to request and update our cache to store the data

    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);

    client.set(req.user.id, JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
