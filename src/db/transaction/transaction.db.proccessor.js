const mongoDB_transaction = require("./mongo.db.transaction");

class transactionDb {
    constructor() {
        this.transaction = new mongoDB_transaction();
    }

    async get(id) {
        return await this.transaction.findById(id);
    }

    async getByTransactionId(transactionId) {
        return await this.transaction.findByTransactionId(transactionId);
    }

    async getByQuery(query) {
        return await this.transaction.getByQuery(query);
    }

    async getByQueryPaginated(query, page, limit) {
        return await this.transaction.getByQueryPaginated(query, page, limit);
    }

    async create(createData) {
        return await this.transaction.create(createData);
    }

    async update(transactionId, updateData) {
        return await this.transaction.update(transactionId, updateData);
    }

    async delete(id) {
        return await this.transaction.delete(id);
    }
}

module.exports = transactionDb;
