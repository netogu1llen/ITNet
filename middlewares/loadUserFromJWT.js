const { verifyToken } = require('../util/jwt');

const loadUserFromJWT = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    res.locals.usuario = null;
    res.locals.isLoggedIn = false;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    res.locals.usuario = decoded;
    res.locals.isLoggedIn = true;
  } catch (err) {
    res.locals.usuario = null;
    res.locals.isLoggedIn = false;
  }

  next();
};

module.exports = loadUserFromJWT;
