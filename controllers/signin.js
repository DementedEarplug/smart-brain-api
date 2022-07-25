const { logger, lineNumber } = require("../utils/logger");
const jwt = require("jsonwebtoken");
const redis = require("redis");

//Set up redis
const redisClient = redis.createClient({ host: "redis", port: 6379 });

/**
 * Helper function that fetches user with the given credentials in the DB.
 * @param {*} db DB object
 * @param {*} bcrypt Bcrypt object
 * @param {*} req Request object
 * @param {*} res Response object
 * @returns User from the with given credentials.
 */
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

/**
 * Get user ID from auth token
 * @param {*} req Request
 * @param {*} res Resposne
 * @returns Object with user id.
 */
const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      logger.error(`[./${lineNumber(new Error())}] ${err}`);
      return res.status(400).json('Unauthorized');
    } else {
      logger.info(`[./${lineNumber(new Error())}] Already have a session!`)
      return res.json({id: reply });
    }
  });
};

/**
 * Creates user session and stores it in Redis
 * @param {Object} user User obbject
 * @returns Object with user info
 */
const createSession = (user) => {
  logger.info(`[./${lineNumber(new Error())}] Create session`);
  const { email, id } = user;
  const token = signToken(email);
  redisClient.set(token, id, redis.print);
  return { sucess: true, id, token };
};

/**
 * Helper function to sign JWT token
 * @param {string} email User email
 * @returns Signed JWT token
 */
const signToken = (email) => {
  logger.info(`[./${lineNumber(new Error())}] Sign token`);
  const payload = { email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

/**
 * Handles user authentication.
 * @param {*} db DB object
 * @param {*} bcrypt Bcrypt object
 * @returns User auth token.
 */
const signinAuthentication = (db, bcrypt) => (req, res) => {
  logger.info(`[./${lineNumber(new Error())}] Initiated signin process`);
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
        .then((user) => {
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
