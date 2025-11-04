const userService = require('../../service/userService')

module.exports = async (req, res, next) => {
    try {
        const UserService = new userService();
        const { value, uid } = req.locals
        console.log(">>>>>>>>>>>", uid, value);
        const result = await UserService.updateUser(uid, value)
        return res.status(200).send(result)
    } catch (error) {
        if (error.code && error.message) {
            return res.status(400).send({ code: error.code, message: error.message })
        }
        console.error('error', error.stack)
        res.status(500).send({ message: 'Internan Server error' })
    }
}