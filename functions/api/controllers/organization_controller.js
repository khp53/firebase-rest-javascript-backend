const Controller = require('./controllers')
const organizationModel = require('../models/organization_model')

const organizationController = new Controller(organizationModel)
module.exports = organizationController.router