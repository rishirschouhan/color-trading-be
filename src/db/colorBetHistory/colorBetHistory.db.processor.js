const mongoDb_colorBetHistory = require('./mongo.db.colorBetHistory');

class colorBetHistoryDb {

    constructor() {
        this.colorBetHistory = new mongoDb_colorBetHistory()
    }

    async findById(id) {
        return await this.colorBetHistory.findById(id);
    }

    async getByquery(query) {
        return await this.colorBetHistory.getByquery(query);
    }

    async create(createData) {
        console.log(":::::Creating Bet History", createData);
        return await this.colorBetHistory.create(createData);
    }

    async update(id, updateData) {
        return await this.colorBetHistory.updateOne({ _id: id }, { $set: { ...updateData } });
    }

    async updateOne(filter, updateData, options = {}) {
        return await this.colorBetHistory.updateOne(filter, updateData, options);
    }

    async delete(id) {
        return await this.colorBetHistory.deleteOne({ _id: id });
    }
}

module.exports = colorBetHistoryDb;