const colorBetHistoryModel = require('../../modal/colorBetHistoryModal');

class colorBetHistoryDb {
  async findById(id) {
    return await colorBetHistoryModel.findById(id);
  }

  async getByquery(query) {
    return await colorBetHistoryModel.find(query);
  }

  async create(createData) {
    console.log(":::::Creating Bet History", createData);
    return await colorBetHistoryModel.create(createData);
  }

  async update(id, updateData) {
    return await colorBetHistoryModel.updateOne({ _id: id }, { $set: { ...updateData } });
  }

  async updateOne(filter, updateData, options = {}) {
    return await colorBetHistoryModel.findOneAndUpdate(filter, updateData, options);
  }

  async delete(id) {
    return await colorBetHistoryModel.deleteOne({ _id: id });
  }
}

module.exports = colorBetHistoryDb;