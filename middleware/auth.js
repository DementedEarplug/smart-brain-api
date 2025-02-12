const { redisClient } = require("../controllers/signin");


const requireAuth = (req, res, next) => {
  console.log(req.headers)
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json("Unauthorized");
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).json("Unauthorized");
    }
    return next();
  });
};

module.exports = {
  requireAuth,
};
