const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

fs.readdir('uploads', (error) => {
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname('file.originalname');
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/// 이미지 업로드 ///
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

/// 게시글 업로드 ///
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where : { title: tag.slice(1).toLowerCase() },
      })));
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/twit');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 해쉬태그 검색 ///
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/twit');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render('twit', {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 게시글 좋아요 ///
router.post('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id }});
    await post.addLiker(parseInt(req.user.id, 10));
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 좋아요 취소 ///
router.delete('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id }});
    await post.removeLiker(parseInt(req.user.id), 10);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/// 게시글 삭제 ///
router.delete('/:id', async (req, res, next) => {
  try {
    await Post.destroy({ where: { id: req.params.id, userId: req.user.id }});
      res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
/// 게시글 수정 ///
router.post('/:id', async (req, res, next) => {
  try {
    await Post.update({ repost: req.body.repost }, {
      where: { post: req.user.post },
    });
      res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
})
*/
module.exports = router;