const { selectUsers } = require('../models/users.model.js');

exports.getUsers = (req, res, next) => {
    selectUsers()
        .then((usersArray) => {
            res
                .status(200)
                .send({ users: usersArray });
        })
        .catch((err) => {
            next(err);
        });
};