const deliveryModel = require('../models/deliveryModel');
const { v4: uuidv4 } = require("uuid");

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
            res.status(200).json({ message: "주소가 수정되었습니다." });
        } catch (err) {
            res.status(500).send("주소 수정 중 오류가 발생하였습니다.");
        }
    },

    // 주소 삭제
    deleteAddress: async (req, res) => {
        try {
            const addressId = req.params.addressId;
            await deliveryModel.deleteAddress(addressId);
            res.status(200).json({ message: "주소가 삭제되었습니다." });
        } catch (err) {
            res.status(500).send("주소 삭제 중 오류가 발생하였습니다.");
        }
    },


    // 주문 생성
    createDelivery: async (req, res) => {
        try {
            const body = req.body;
            const deliveryId = uuidv4();
            const address = await deliveryModel.getAddress(body.addressId);
            const DeliveryData = {
                delivery_id: deliveryId,
                store_id: body.storeId,
                user_name: body.userName,
                product_id: body.productId,
                address,
                payment_amount: body.paymentAmount,
                quantity: body.quantity
            }
            await deliveryModel.createDelivery(DeliveryData);
            res.status(201).json({ message: "주문이 완료되었습니다." });
        } catch (err) {
            res.status(500).send("주문 생성 중 오류가 발생하였습니다.");
        }
    },

    // 주문 취소
    cancelDelivery: async (req, res) => {
        try {
            const { cancelReason, deliveryId } = req.body;
            await deliveryModel.cancelDelivery(cancelReason, deliveryId);
            res.status(200).json({ message: "주문이 취소되었습니다." });
        } catch (err) {
            res.status(500).send("주문 취소 중 오류가 발생하였습니다.");
        }
    },

    // 배송 주문 조회 - 주문자
    showUserDelivery: async (req, res) => {
        try {
            const { userName, status } = req.query;
            let result;
            const getStatusMapping = {
                'All': '전체',
                'Order Completed': '주문 완료',
                'Order Canceled': '주문 취소',
                'Shipping': '배송중',
                'Delivered': '배송 완료'
            };
            const getStatus = getStatusMapping[status];
            result = await deliveryModel.statusUserDelivery(userName, getStatus);
            if (!result || (Array.isArray(result) && result.length === 0)) {
                result = { message: "해당 내역이 존재하지 않습니다." };
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("주문 조회 중 오류가 발생하였습니다.");
        }
    },

    // 배송 주문 조회 - 판매자
    showPresidentDelivery: async (req, res) => {
        try {
            const { userName, storeId, status } = req.query;
            const products = await deliveryModel.getProducts(userName, storeId);
            const getStatusMapping = {
                'All': '전체',
                'Order Completed': '주문 완료',
                'Order Canceled': '주문 취소',
                'Shipping': '배송중',
                'Delivered': '배송 완료'
            };
            let result;
            const getStatus = getStatusMapping[status];
            if (products) {
                result = await deliveryModel.statusPresidentDelivery(storeId, getStatus);

                if (!result || (Array.isArray(result) && result.length === 0)) {
                    result = { message: "해당 내역이 존재하지 않습니다." };
                }
                res.status(200).json(result);
            } else {
                res.status(400).send("일치하는 값이 없습니다.");
            }
        } catch (err) {
            res.status(500).send("주문 조회 중 오류가 발생하였습니다.");
        }
    },

    // 배송 상태 변경
    changeStatusDelivery: async (req, res) => {
        try {
            const { deliveryId, status } = req.body;
            const getStatusMapping = {
                'Order Completed': '주문 완료',
                'Shipping': '배송중',
                'Delivered': '배송 완료'
            };
            const getStatus = getStatusMapping[status];
            await deliveryModel.changeStatusDelivery(getStatus, deliveryId);
            res.status(200).json({ message: `배송 상태가 ${getStatus}(으)로 변경되었습니다.` });
        } catch (err) {
            console.log(err);
            res.status(500).send("배송 상태 변경 중 오류가 발생하였습니다.");
        }
    },

}

module.exports = { deliveryController }