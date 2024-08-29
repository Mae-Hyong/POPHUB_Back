const deliveryModel = require('../models/deliveryModel');

const deliveryController = {

    // 유저별 주소 조회
    showAddress: async (req, res) => {
        try {
            const userName = req.params.userName;
            let result = await deliveryModel.showAddress(userName);
            result = result.length > 0 ? result : { message: "등록된 주소가 없습니다." };
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("유저별 주소 조회 중 오류가 발생하였습니다.");
        }
    },

    // 주소 등록
    createAddress: async (req, res) => {
        try {
            const { userName, address } = req.body;
            const addressData = {
                user_name: userName,
                address
            }
            await deliveryModel.createAddress(addressData);
            res.status(201).json({ message: "주소가 등록되었습니다." });
        } catch (err) {
            res.status(500).send("주소 등록 중 오류가 발생하였습니다.");
        }
    },

    // 주소 수정
    updateAddress: async (req, res) => {
        try {
            const { addressId, address } = req.body;
            await deliveryModel.updateAddress(address, addressId);
            res.status(200).json({ message: "주소가 수정되었습니다."});
        } catch (err) {
            res.status(500).send("주소 수정 중 오류가 발생하였습니다.");
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const addressId = req.params.addressId;
            await deliveryModel.deleteAddress(addressId);
            res.status(200).json({ message: "주소가 삭제되었습니다." });
        } catch (err) {
            console.log(err);
            res.status(500).send("주소 삭제 중 오류가 발생하였습니다.");
        }
    }
}

module.exports = { deliveryController }