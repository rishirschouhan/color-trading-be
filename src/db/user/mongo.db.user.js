const userModal = require("../../modal/userModal")

class userDb {
    async get(id) {
        return await userModal.findById(id)
    }

    async getByquery(query) {
        return await userModal.find(query)
    }
    async create(createData) {
        return await userModal.create(createData)
    }
    async update(uid, updateData) {
        return await userModal.findOneAndUpdate({ _id: uid }, { $set: { ...updateData } })
    }

    async delete(id) {

    }
}

module.exports = userDb