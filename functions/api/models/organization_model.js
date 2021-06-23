const Model = require('./model')

// singleton class

class OrganizationModel extends Model {
    constructor() {
        super('organizations')
        if (this.instance) return this.instance
        OrganizationModel.instance = this
    }
}

module.exports = new OrganizationModel();