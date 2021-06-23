const Model = require('./model');

// singleton

class UserModel extends Model {
    constructor() {
        super('users')
        if (this.instance) return this.instance
        UserModel.instance = this
    }
}

module.exports = new UserModel()