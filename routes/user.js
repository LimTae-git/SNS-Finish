const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/// 팔로우 ///
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error)
    next(error)
  }
});

/// 언팔로우 ///
router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    await user.removeFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error)
    next(error)
  }
});


/// 닉네임 수정 라우터 ///
router.post('/profile', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({ nick: req.body.nick }, {
      where: { id: req.user.id },
    });
    return res.redirect('/profile');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});


module.exports = router;