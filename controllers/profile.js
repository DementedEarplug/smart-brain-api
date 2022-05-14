const { logger,lineNumber } = require("../utils/logger");

const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
};

const handleProfilePut = (req, res, db) => {
  const { id } = req.params;
  const { name, age, pet } = req.body;

  db('users').where({ id })
    .update({ name, age, pet })
    .then((user) => {
      if (user) {
        logger.info(`[./${lineNumber(new Error())}] ${user}`)
        res.json({data: user, msg:"Succesfully updated profile!"});
      } else {
        res.status(400).json("Failed to update profile.");
      }
    })
    .catch((err) =>{
      logger.error(`[./${lineNumber(new Error())}] ${err}`);
      res.status(400).json("Error updating user")
    });
};

module.exports = {
  handleProfileGet,
  handleProfilePut
};
