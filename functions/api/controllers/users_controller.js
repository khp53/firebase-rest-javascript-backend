const Controller = require('./controllers')
const userModel = require('../models/users_model')

const usersController = new Controller(userModel)
module.exports = usersController.router