const { logger, lineNumber } = require("../utils/logger");
const jwt = require("jsonwebtoken");
const redis = require('redis')

//Set up redis
const redisClient = redis.createClient({host: 'redis', port: 6379})

const handleSignin = (db, bcrypt, req, res) => {
  logger.info(`[./${lineNumber(new Error())}] Handle signin.`);
  logger.info(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    logger.error(`[./${lineNumber(new Error())}] Password and email missing`);
    return Promise.reject("incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => user[0])
          .catch((err) => {
            logger.error(
              `[./${lineNumber(new Error())}] Password and email missing`
            );
            return Promise.reject("unable to get user");
          });
      } else {
        logger.error(`[./${lineNumber(new Error())}] Invalid Credentials`);
        return Promise.reject("wrong credentials");
      }
    })
    .catch((err) => {
      logger.error(`[./${lineNumber(new Error())}] ${err}`);
      return Promise.reject("wrong credentials");
    });
};

const getAuthTokenId = () => {

  console.log("auth ok!");
};

const createSession = (user) => {
  logger.info(`[./${lineNumber(new Error())}] Create session`);
  const { email, id } = user;
  const token = signToken(email);
  redisClient.set(`${email}`, token, redis.print)
  return { sucess: true, id, token };
};

const signToken = (email) => {
  logger.info(`[./${lineNumber(new Error())}] Sign token`);
  const payload = { email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  logger.info(`[./${lineNumber(new Error())}] Initiated signin process`);
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId()
    : handleSignin(db, bcrypt, req, res)
        .then((user) => {
          logger.warn(`[./${lineNumber(new Error())}] ${user}`);
          user.id !== null && user.email !== null
            ? res.json(createSession(user))
            : Promise.reject("Problem fetching user data");
        })
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signinAuthentication,
};
