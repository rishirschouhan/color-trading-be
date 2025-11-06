const transactionModal = require("../../modal/transactionModal");

class transactionDb {
    async findById(id) {
        return await transactionModal.findById(id).populate('userId', 'name email phoneNumber');
    }

    async findByTransactionId(transactionId) {
        return await transactionModal.findOne({ transactionId }).populate('userId', 'name email phoneNumber');
    }

    async getByQuery(query) {
        return await transactionModal.find(query).populate('userId', 'name email phoneNumber').sort({ createdAt: -1 });
    }

    async getByQueryPaginated(query, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const transactions = await transactionModal
            .find(query)
            .populate('userId', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await transactionModal.countDocuments(query);
        
        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async create(createData) {
        return await transactionModal.create(createData);
    }

    async update(transactionId, updateData) {
        return await transactionModal.findOneAndUpdate(
            { transactionId }, 
            { $set: { ...updateData } },
            { new: true }
        ).populate('userId', 'name email phoneNumber');
    }

    async delete(id) {
        return await transactionModal.findByIdAndDelete(id);
    }
}

module.exports = transactionDb;
