const signUpReqModal = require("../../modal/signUpReqModal")

class signUpReqDb {

    async findById(id) {
        return await signUpReqModal.findById(id)
    }

    async getByquery(query) {
        return await signUpReqModal.find(query)
    }
    async create(createData) {
         console.log(":::::PPPPPPP", createData)
        return await signUpReqModal.create(createData)
    }

    async update(id, updateData) {
        return await signUpReqModal.updateOne({ _id: id }, { $set: { ...updateData } });
    }

    async delete(id) {
        return await signUpReqModal.deleteOne(id);
    }
}

module.exports = signUpReqDb