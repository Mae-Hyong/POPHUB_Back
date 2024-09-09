const fundingModel = require('../models/fundingModel');

const fundingController = {
    createFunding: async (req, res) => {
        try {
            const body = req.body;
            let image = req.file ? req.file.location : null;
            const fundingData = {
                user_name: body.userName,
                title: body.title,
                content: body.content,
                amount: body.amount,
                donation: body.donation,
                open_date: body.openDate,
                close_date: body.closeDate
            };

            await fundingModel.createFunding(fundingData);

            if (image) {
                const fundingImg = {
                    funding_id: fundingId,
                    image: image,
                }

                await fundingModel.fundingImg(fundingImg);
            }

            return res.status(201).send('Funding Data Added');
        } catch (err) {
            return res.status(500).send('Funding 데이터를 입력 도중 오류가 발생했습니다.');
        }
    },

    createItem: async (req, res) => {
        try {
            const body = req.body;
            let image = req.file ? req.file.location : null;
            const itemData = {
                funding_id: body.fundingId,
                user_name: body.userName,
                item_name: body.title,
                content: body.content,
                count: body.count,
                amount: body.amount,
            };

            await fundingModel.createItem(itemData);

            if (image) {
                const fundingImg = {
                    funding_id: fundingId,
                    image: image,
                }

                await fundingModel.itemImg(fundingImg);
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
            const fundingId = req.query;
            const userName = req.query;
            if (!fundingId && !userName) {
                const result = await fundingModel.searchFunding();
                const fundingList = await Promise.all(
                    result.map(async (result) => {
                        const images = await fundingModel.imagesByFundingId(fundingId);
                        return {
                            fundingId: result.funding_id,
                            userName: result.userName,
                            title: result.title,
                            content: result.content,
                            amount: result.amount, // 목표금액
                            donation: result.donation, // 후원 금액
                            progress: result.donation / result.amount * 100,
                            status: result.status,
                            openDate: result.openDate,
                            closeDate: result.closeDate,
                            images: images.map(image => image.image_url)
                        };
                    })
                );
                return res.status(200).send(fundingList);
            } else if (fundingId) {
                const funding = await fundingModel.fundingById(fundingId);
                const images = await fundingModel.imagesByFundingId(fundingId);
                return res.status(200).json({ funding, images: images.map(image => image.image_url) })
            } else {
                const funding = await fundingModel.fundingByUser(userName)
                return res.status(200).send(funding)
            }
        } catch (err) {
            res.status(500).send("펀딩 조회 중 오류 발생")
        }
    },

    searchItem: async (req, res) => {
        try {
            const { fundingId, itemId } = req.query;
            if (!fundingId) {
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
                    images: images.map(image => image.image_url)
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
                            images: images.map(image => image.image_url)
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
        try {

        } catch (err) {

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