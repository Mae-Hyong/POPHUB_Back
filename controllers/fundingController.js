const fundingModel = require('../models/fundingModel');
const { v1 } = require("uuid")

const fundingController = {
    createFunding: async (req, res) => {
        try {
            const body = req.body;
            const images = req.files ? req.files.map(file => file.location) : []; // 파일이 여러 개일 경우 배열로 처리
            const fundingId = v1()
            // Funding 데이터를 객체로 생성
            const fundingData = {
                funding_id: fundingId,
                user_name: body.userName,
                title: body.title,
                content: body.content,
                amount: body.amount,
                donation: body.donation,
                open_date: body.openDate,
                close_date: body.closeDate
            };

            // 데이터베이스에 펀딩 정보 저장
            await fundingModel.createFunding(fundingData);

            if (req.files && req.files.length > 0) {
                if (req.files) {
                    await Promise.all(req.files.map(async (file) => {
                        images.push(file.location);
                        await fundingModel.fundingImg(fundingId, file.location);
                    }));
                }
            }

            return res.status(201).send('Funding Data Added');
        } catch (err) {
            console.error(err)
            return res.status(500).send('Funding 데이터를 입력 도중 오류가 발생했습니다.');
        }
    },

    createItem: async (req, res) => {
        try {
            const body = req.body;
            const images = req.files ? req.files.map(file => file.location) : [];
            const itemId = v1()
            const itemData = {
                item_id: itemId,
                funding_id: body.fundingId,
                user_name: body.userName,
                item_name: body.title,
                content: body.content,
                count: body.count,
                amount: body.amount,
            };

            await fundingModel.createItem(itemData);

            if (req.files && req.files.length > 0) {
                if (req.files) {
                    await Promise.all(req.files.map(async (file) => {
                        images.push(file.location);
                        await fundingModel.itemImg(itemId, file.location);
                    }));
                }
            }
            return res.status(201).send('Item Data Added');
        } catch (err) {
            return res.status(500).send('Item 데이터를 입력 도중 오류가 발생했습니다.');
        }
    },

    // createlist: async(req, res) => {
    //     try {
    //         const body = req.body;
    //         let image = req.file ? req.file.location : null;
    //         const listData = {
    //             funding_id: body.fundingId,
    //             item_id: body.itemId,
    //             partner_order_id: body.partnerOrderId,
    //             user_name: body.userName,
    //         };

    //         await fundingModel.createList(listData);

    //         return res.status(201).send('Item Data Added')
    //     } catch (err) {

    //     }
    // },

    searchFunding: async (req, res) => {
        try {
            let fundingId = req.query.fundingId;
            const userName = req.query.userName;
            if (!fundingId && !userName) {
                const result = await fundingModel.searchFunding();
                const fundingList = await Promise.all(
                    result.map(async (result) => {
                        fundingId = result.funding_id;
                        const images = await fundingModel.imagesByFundingId(fundingId);
                        return {
                            fundingId: result.funding_id,
                            userName: result.user_name,
                            title: result.title,
                            content: result.content,
                            amount: result.amount, // 목표금액
                            donation: result.donation, // 후원 금액
                            progress: result.donation / result.amount * 100,
                            status: result.status,
                            openDate: result.openDate,
                            closeDate: result.closeDate,
                            images: images.map(image => image.image)
                        };
                    })
                );
                return res.status(200).send(fundingList);
            } else if (fundingId) {
                const result = await fundingModel.fundingById(fundingId);
                const images = await fundingModel.imagesByFundingId(fundingId);
                return res.status(200).json({ result, progress: result.donation / result.amount * 100, images: images.map(image => image.image) })
            } else {
                const result = await fundingModel.fundingByUser(userName)
                fundingId = result.funding_id;
                const images = await fundingModel.imagesByFundingId(fundingId);
                return res.status(200).json({ result, progress: result.donation / result.amount * 100, images: images.map(imge => imge.image) })
            }
        } catch (err) {
            console.error(err)
            return res.status(500).send("펀딩 조회 중 오류 발생")
        }
    },

    searchItem: async (req, res) => {
        try {
            const { fundingId, itemId } = req.query;
            if(!fundingId && !itemId){
                return res.status(404).send("fundingId 혹은 itemId를 입력해야합니다.");
            }else if (!fundingId) {
                const result = await fundingModel.selectItem(itemId);
                const images = await fundingModel.imagesByitemId(itemId);
                const resultList = {
                    itemId: result.item_id,
                    fundingId: result.funding_id,
                    userName: result.user_name,
                    itemName: result.item_name,
                    content: result.content,
                    count: result.count,
                    amount: result.amount,
                    images: images.map(image => image.image)
                };
                return res.status(200).json(resultList);
            } else if (!itemId) {
                const result = await fundingModel.searchFunding(fundingId);
                const resultList = await new Promise.all(
                    result.map(async (result) => {
                        const images = await fundingModel.imagesByFundingId(fundingId);
                        return {
                            itemId: result.item_id,
                            fundingId: result.funding_id,
                            userName: result.user_name,
                            itemName: result.item_name,
                            content: result.content,
                            count: result.count,
                            amount: result.amount,
                            images: images.map(image => image.image)
                        };
                    })
                )
                return res.status(200).json(resultList);
            }
        } catch (err) {
            return res.status(500).send("아이템 조회 중 오류 발생")
        }
    },

    searchlist: async (req, res) => {
        const formatResult = (result) => ({
            orderId: result.order_id,
            fundingId: result.funding_id,
            itemId: result.item_id,
            partnerOrderId: result.partner_order_id,
            userName: result.user_name,
            itemName: result.item_name,
            quantity: result.quantity,
            totalAmount: result.total_amount,
            vatAmount: result.vat_amount,
            taxFreeAmount: result.tax_free_amount,
        });

        try {
            const { fundingId, itemId, userName } = req.query;
            let result;
            
            if (fundingId) result = await fundingModel.searchListByFunding(fundingId);
            else if (itemId) result = await fundingModel.searchListByItem(itemId);
            else result = await fundingModel.searchListByUser(userName);

            const resultList = await Promise.all(result.map(formatResult));

            return res.status(200).json(resultList);

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    updateFunding: async (req, res) => {
        try {

        } catch (err) {

        }
    },

    updateItem: async (req, res) => {
        try {

        } catch (err) {

        }
    },
}

module.exports = fundingController;