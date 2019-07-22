'use strict';

const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const { isLoggedIn, isNotLoggedIn, isFormFilled } = require('../middlewares/authMiddlewares');

const router = express.Router();
const saltRounds = 10;

/* GET home page. */
router.get('/signup', isLoggedIn, (req, res, next) => {
  res.render('signup');
});

// renderizado del formulario

router.post('/signup', isLoggedIn, isFormFilled, async (req, res, next) => {
  // hay que proteger tanto los GETS como los POSTS (porque aunque no tengas un form a través de otras plataformas se puede lanzar)
  try {
    const { username, password } = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await User.findOne({ username });
    if (user) {
      return res.redirect('/auth/signup');
    };
    const newUser = await User.create({
      username,
      password: hashedPassword
    });
    req.session.currentUser = newUser;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

// cuando le de al signup

router.get('/login', isLoggedIn, (req, res, next) => {
  res.render('login');
});

// cuando le de al login

router.post('/login', isLoggedIn, isFormFilled, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/auth/login');
    }
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/');
    } else {
      res.redirect('/auth/login');
    }
  } catch (error) {
    next(error);
  }
});

// cuando le de a logout, no hay get logout porque no mostrará ningún formulario solo redirigirá a la home

router.post('/logout', isNotLoggedIn, (req, res, next) => {
  delete req.session.currentUser;
  res.redirect('/');
});

module.exports = router;
