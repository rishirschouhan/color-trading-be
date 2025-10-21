const mongoDB_user = require("./mongo.db.user")

class userDb {

    constructor() {
        this.user = new mongoDB_user()
    }

    async get(id) {
        return await this.user.findById(id)
    }

    async getByquery(query) {
        return await this.user.getByquery(query)
    }
    async create(createData) {
         console.log(">>>>>>>>>>>",createData);
        return await this.user.create(createData)
    }
    async update(uid, updateData) {
        return await this.user.update(uid, updateData)
    }

    async delete(id) {

    }
}

module.exports = userDb