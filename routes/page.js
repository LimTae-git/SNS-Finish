const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

/// 로그인 페이지 ///
router.get('/', isNotLoggedIn, (req, res) => {
  res.render('login')
})

/// 프로필 페이지 ///
router.get('/profile', isLoggedIn,  (req, res) => {
  Post.findAll({
    include: [{
      model: User,
      arrtributes: ['id', 'nick', 'updatedAt'],
    }, {
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  })
  .then((posts) => {
    res.render('profile', {
      title: 'NodeBird',
      twits: posts,
      user: req.user,
      loginError: req.flash('loginError'),
    });
  })
  .catch((error) => {
    console.error(error);
    next(error);
  });
});

/// 프로필 수정페이지 ///
router.get('/modify', isLoggedIn, (req, res) => {
    res.render('modify', {title: '내 정보 - NodeBird', user: req.user })
})

/// 회원가입 페이지 ///
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

/// 트윗 페이지 ///
router.get('/twit', (req, res, next) => {
  Post.findAll({
    include: [{
      model: User,
      arrtributes: ['id', 'nick', 'updatedAt'],
    }, {
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  })
  .then((posts) => {
    res.render('twit', {
      title: 'NodeBird',
      twits: posts,
      user: req.user,
      loginError: req.flash('loginError'),
    });
  })
  .catch((error) => {
    console.error(error);
    next(error);
  });
});

/// 팔로우 리스트 페이지 ///
router.get('/followlist', isLoggedIn, (req, res) => {
  Post.findAll({
    include: [{
      model: User,
      arrtributes: ['id', 'nick', 'updatedAt'],
    }, {
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  })
  .then((posts) => {
    res.render('list', {
      title: 'NodeBird',
      twits: posts,
      user: req.user,
      loginError: req.flash('loginError'),
    });
  })
  .catch((error) => {
    console.error(error);
    next(error);
  });
})
module.exports = router;
