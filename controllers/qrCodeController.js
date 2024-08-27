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
                return res.status(200).json({ message: "QR코드가 생성되었습니다.", QRCode });
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
            res.status(200).json({ qrcode_url: result[0].qrcode_url });
        } catch (err) {
            res.status(500).send("QR코드 조회 중 오류가 발생하였습니다.");
        }
    },

    // QR 코드 스캔 - 스토어
    scanQrCodeForStore: async (req, res) => {
        try {
            const qrCode = req.query.qrCode;
            const storeId = await qrCodeModel.scanQrCodeForStore(qrCode);
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
            const qrCode = req.body.qrCode;
            const userName = req.body.userName;
            const storeId = await qrCodeModel.scanQrCodeForStore(qrCode);
            let result;
            if (type == 'reservation') {
                result = await qrCodeModel.reservationForVisit(storeId, userName);
            } else if (type == 'waiting') {
                result = await qrCodeModel.waitingForVisit(storeId, userName);
            } else {
                return res.status(400).send("'reservaion' 또는 'waiting'을 사용하세요.");
            }

            if (result.success) {
                const calendarData = {
                    user_name: userName,
                    store_id: storeId,
                    reservation_date: result.reservation_date
                }
                await qrCodeModel.createCalendar(calendarData);
                return res.status(200).json({ message: "방문 인증이 완료되었습니다." });
            } else {
                return res.status(500).json({ message: "방문 인증 처리 중 오류가 발생하였습니다." });
            }

        } catch (err) {
            res.status(500).send("QR코드 스캔 중 오류가 발생하였습니다.");
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