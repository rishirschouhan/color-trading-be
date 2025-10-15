const mongoDb_signUpReq = require("./mongo.db.signupreq")

class signUpReqDb {

    constructor() {
        this.signup = new mongoDb_signUpReq()
    }

    async get(id) {
        return await this.signup.findById(id)
    }

    async getByquery(query) {
        return await this.signup.getByquery(query)
    }

    async create(createData) {
        return await this.signup.create(createData)
    }

    async update(id, updateData) {
        return await this.signup.update(id, updateData);
    }

    async delete(id) {
        return await this.signup.delete(id);
    }
}

module.exports = signUpReqDb