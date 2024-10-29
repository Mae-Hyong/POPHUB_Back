const qrCodeModel = require('../models/qrCodeModel');
const popupModel = require('../models/popupModel');
const qrCode = require('qrcode');

const qrCodeController = {

    // QR코드 생성
    createQrCode: async (req, res) => {
        try {
            const storeId = req.query.storeId;
            const check = await qrCodeModel.checkQrCode(storeId);
            if (check === null) {
                return res.status(404).json({ message: "해당 팝업의 ID가 존재하지 않습니다." });
            } else if (check.length > 0) {
                return res.status(200).json({ message: "이미 QR코드가 존재합니다.", QRcode: check[0].qrcode_url });
            } else {
                const QRCode = await qrCode.toDataURL(storeId);
                const qrCodeData = {
                    store_id: storeId,
                    qrcode_url: QRCode,
                }
                await qrCodeModel.createQrCode(qrCodeData);
                return res.status(201).json({ message: "QR코드가 생성되었습니다.", QRCode });
            }
        } catch (err) {
            res.status(500).send("QR코드 생성 중 오류가 발생하였습니다.");
        }
    },

    // QR 코드 삭제
    deleteQrCode: async (req, res) => {
        try {
            const storeId = req.query.storeId;
            await qrCodeModel.deleteQrCode(storeId);
            res.status(200).json({ message: "QR코드가 삭제되었습니다." });
        } catch (err) {
            res.status(500).send("QR코드 삭제 중 오류가 발생하였습니다.");
        }
    },

    // QR 코드 조회
    showQrCode: async (req, res) => {
        try {
            const storeId = req.query.storeId;
            const result = await qrCodeModel.showQrCode(storeId);
            res.status(200).json({qrcode_id: result[0].qrcode_id, qrcode_url: result[0].qrcode_url });
        } catch (err) {
            res.status(500).send("QR코드 조회 중 오류가 발생하였습니다.");
        }
    },

    // QR 코드 스캔 - 스토어
    scanQrCodeForStore: async (req, res) => {
        try {
            const qrCodeId = req.query.qrCodeId;
            const storeId = await qrCodeModel.scanQrCodeForStore(qrCodeId);
            if (storeId == null) {
                return res.status(404).json({ message: "스토어를 찾을 수 없습니다. QR코드를 다시 확인해주세요." });
            }
            const result = await popupModel.getPopup(storeId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("QR코드 스캔 중 오류가 발생하였습니다.");
        }
    },

    // QR 코드 스캔 - 방문 인증
    scanQrCodeForVisit: async (req, res) => {
        try {
            const type = req.query.type;
            const qrCodeId = req.body.qrCodeId;
            const reservationId = req.body.reservationId;
            const storeId = await qrCodeModel.scanQrCodeForStore(qrCodeId);
            let result;
            if (type == 'reservation') {
                result = await qrCodeModel.reservationForVisit(storeId, reservationId);
            } else if (type == 'waiting') {
                result = await qrCodeModel.waitingForVisit(storeId, reservationId);
            } else {
                return res.status(400).send("정확한 값을 입력해주세요.");
            }

            if (result.success) {
                const calendarData = {
                    user_name: result.user_name,
                    store_id: storeId,
                    reservation_date: result.reservation_date
                };

                try {
                    await qrCodeModel.createCalendar(calendarData);
                    return res.status(200).json({ message: "방문 인증이 완료되었습니다." });
                } catch (err) {
                    console.log(err);
                    return res.status(500).json({ message: "처리된 방문인증입니다." });
                }
                
            } else {
                return res.status(500).json({ message: "방문 인증에 실패하였습니다." });
            }

        } catch (err) {
            console.log(err);
            res.status(500).send("사전 예약 및 현장 대기 등록 진행 후 방문 인증이 가능합니다.");
        }
    },

    // 캘린더 조회
    showCalendar: async (req, res) => {
        try {
            const userName = req.query.userName;
            const result = await qrCodeModel.showCalendar(userName);

            if (result.length === 0) {
                return res.status(200).json({ message: "방문인증된 팝업이 없습니다." });
            }

            return res.status(200).json(result);
        } catch (err) {
            res.status(500).send("캘린더 조회 중 오류가 발생하였습니다.");
        }
    }
}

module.exports = { qrCodeController }