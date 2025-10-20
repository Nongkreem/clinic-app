const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Routes
router.post('/login', (req, res, next) => {
  console.log('/login route hit');
  authController.login(req, res, next);
});

router.post('/register', (req, res, next) => {
  console.log('/register route hit');
  authController.register(req, res, next);
});

router.post('/check-blacklist', (req, res, next) => {
  console.log('/check-blacklist route hit!');
  console.log('Body:', req.body);
  console.log('HN:', req.body.hn);
  
  if (!authController.checkBlacklist) {
    console.error('authController.checkBlacklist is undefined!');
    return res.status(500).json({ 
      success: false, 
      message: 'checkBlacklist function not found' 
    });
  }
  
  authController.checkBlacklist(req, res, next);
});



module.exports = router;