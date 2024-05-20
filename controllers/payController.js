const payModel = require('../models/payModel')

const axios = require('axios');
const { v4 } = require('uuid');

const SERVER_URL = "https://pophub-fa05bf3eabc0.herokuapp.com/";
const MY_ADMIN_KEY = process.env.KAKAO_KEY;
const CID = "TC0ONETIME";
let tid;

const $axios = axios.create({
    baseURL: "https://kapi.kakao.com",
    timeout: 3000,
    headers: {
        Authorization: `KakaoAK ${MY_ADMIN_KEY}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
    }
});

const payController = {
    payRequest : async(req, res) => {
        try {
            const { userId, itemName, quantity, totalAmount, vatAmount, taxFreeAmount } = req.body;
            const orderId = v4()
            const PARTNER_ORDER_ID = v4();
            const PARTNER_USER_ID = v4();
            const paymentId = v4();

            const payRequestData = {
                order_id: orderId,
                store_id: req.body.storeId || null,
                product_id: req.body.productId || null,
                partner_order_id: PARTNER_ORDER_ID,
                user_id: userId,
                item_name: itemName,
                quantity: quantity,
                total_amount: totalAmount,
                vat_amount: vatAmount,
                tax_free_amount: taxFreeAmount,
            };

            if (!req.body.storeId) delete payRequestData.store_id;
            if (!req.body.productId) delete payRequestData.product_id;

            await payModel.payRequest(payRequestData);

            const response = await $axios.post("/v1/payment/ready", {
                cid: CID,
                partner_order_id: PARTNER_ORDER_ID, // 가맹점 주문 ID
                partner_user_id: PARTNER_USER_ID, // 가맹점 사용자 ID
                item_name: itemName, // 상품 명
                quantity: quantity,  // 수량
                total_amount: totalAmount, // 결제 금액
                vat_amount: vatAmount, // 부가세
                tax_free_amount: taxFreeAmount, // 비과세
                approval_url: `${SERVER_URL}pay/success?partner_order_id=${PARTNER_ORDER_ID}&partner_user_id=${PARTNER_USER_ID}&cid=${CID}&payment_id=${paymentId};`,
                fail_url: `${SERVER_URL}pay/fail`, // 결제 실패 시 리디렉션될 URL
                cancel_url: `${SERVER_URL}pay/cancel`, // 결제 취소 시 리디렉션될 URL
            });
            tid = response.data.tid;

            const paymentsData = {
                payment_id : paymentId,
                order_id : orderId,
                tid : tid,                
            }

            
            await payModel.payments(paymentsData)

            res.send(response.data.next_redirect_pc_url);
        } catch (error) {
            console.error("카카오페이 결제 요청 실패:", error.message);
            res.status(500).send("카카오페이 결제 요청 실패");
        }
    },

    success : async(req, res) => {
        try {
            const param = req.query;
            const paymentId = param.payment_id
            console.log(tid);
            const response = await $axios.post("/v1/payment/approve", {
                cid: param.cid,
                tid: tid,
                partner_order_id: param.partner_order_id,
                partner_user_id: param.partner_user_id,
                pg_token: param.pg_token,
            });

            const aid = response.data.aid;
            console.log(response.data.aid);
            await payModel.updatePayments(paymentId, aid);
    
            res.send("CLOSE THE POPUP");
        } catch (error) {
            console.error("카카오페이 결제 승인 실패:", error.message);
            res.status(500).send("카카오페이 결제 승인 실패");
        }
    },

    fail : async(req, res) => {
        console.log('kakaopay :: fail');
        res.send("Payment failed");
    },
    cancel : async(req, res) => {
        console.log('kakaopay :: cancel');
        res.send("Payment canceled");
    }
}

module.exports = payController;
