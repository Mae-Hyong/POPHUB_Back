const fundingModel = require("../models/fundingModel");
const { v1 } = require("uuid");

const fundingController = {
    createFunding: async (req, res) => {
        try {
            const body = req.body;
            const images = req.files ? req.files.map((file) => file.location) : []; // 파일이 여러 개일 경우 배열로 처리
            const fundingId = v1();
            // Funding 데이터를 객체로 생성
            const fundingData = {
                funding_id: fundingId,
                user_name: body.userName,
                title: body.title,
                content: body.content,
                amount: body.amount,
                donation: 0,
                open_date: body.openDate,
                close_date: body.closeDate,
                payment_date: body.paymentDate,
            };

            // 데이터베이스에 펀딩 정보 저장
            await fundingModel.createFunding(fundingData);

            if (req.files && req.files.length > 0) {
                if (req.files) {
                    await Promise.all(
                        req.files.map(async (file) => {
                            images.push(file.location);
                            await fundingModel.fundingImg(
                                fundingId,
                                file.location
                            );
                        })
                    );
                }
            }

            return res.status(201).send(fundingId);
        } catch (err) {
            return res.status(500).send("Funding 데이터를 입력 도중 오류가 발생했습니다.");
        }
    },

    createItem: async (req, res) => {
        try {
            const body = req.body;
            const images = req.files ? req.files.map((file) => file.location) : [];
            const itemId = v1();
            const itemData = {
                item_id: itemId,
                funding_id: body.fundingId,
                user_name: body.userName,
                item_name: body.itemName,
                content: body.content,
                count: body.count,
                amount: body.amount,
            };

            await fundingModel.createItem(itemData);

            if (req.files && req.files.length > 0) {
                if (req.files) {
                    await Promise.all(
                        req.files.map(async (file) => {
                            images.push(file.location);
                            await fundingModel.itemImg(itemId, file.location);
                        })
                    );
                }
            }
            return res.status(201).send("Item Data Added");
        } catch (err) {
            return res.status(500).send("Item 데이터를 입력 도중 오류가 발생했습니다.");
        }
    },

    createFundingSupport: async (req, res) => {
        try {
            const body = req.body;
            const insertData = {
                item_id: body.itemId,
                user_name: body.userName,
                amount: body.amount,
                count: body.count,
            };

            await fundingModel.createFundingSupport(insertData);

            return res.status(201).send("Item Data Added");
        } catch (err) {
            return res.status(500).send("펀딩 후원 목록 조회 중 오류 발생");
        }
    },

    searchFunding: async (req, res) => {
        try {
            const fundingId = req.query.fundingId;
            const userName = req.query.userName;

            const getFundingDetails = async (result) => {
                const images = await fundingModel.imagesByFundingId(result.funding_id);
                return {
                    fundingId: result.funding_id,
                    userName: result.user_name,
                    title: result.title,
                    content: result.content,
                    amount: result.amount, // 목표금액
                    donation: result.donation, // 후원 금액
                    progress: result.amount ? (result.donation / result.amount) * 100 : 0,
                    status: result.status,
                    openDate: result.open_date,
                    closeDate: result.close_date,
                    payment_date: result.payment_date,
                    images: images.map((image) => image.image),
                };
            };

            let result;

            if (!fundingId && !userName) {
                result = await fundingModel.searchFunding();
                if (!result.length)
                    return res.status(200).send("Not Found fundingList");
                const fundingList = await Promise.all(result.map(getFundingDetails));
                return res.status(200).json(fundingList);
            } else if (fundingId) {
                result = await fundingModel.fundingById(fundingId);
                if (!result) return res.status(200).send("Not Found Funding");
                const fundingList = [await getFundingDetails(result)];
                return res.status(200).json(fundingList);
            } else {
                // userName이 주어진 경우
                result = await fundingModel.fundingByUser(userName);
                if (!result) return res.status(200).send("Not Found User");
                const fundingList = await Promise.all(result.map(getFundingDetails));
                return res.status(200).json(fundingList);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send("펀딩 조회 중 오류 발생");
        }
    },

    searchItem: async (req, res) => {
        try {
            const { fundingId, itemId } = req.query;
            if (!fundingId && !itemId) {
                return res.status(404).send("fundingId 혹은 itemId를 입력해야합니다.");
            } else if (!fundingId) {
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
                    images: images.map((image) => image.image),
                };
                return res.status(200).json(resultList);
            } else if (!itemId) {
                const result = await fundingModel.searchItemByFunding(fundingId);
                const resultList = await Promise.all(
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
                            images: images.map((image) => image.image),
                        };
                    })
                );
                return res.status(200).json(resultList);
            }
        } catch (err) {
            console.error(err)
            return res.status(500).send("아이템 조회 중 오류 발생");
        }
    },

    searchlist: async (req, res) => {
        try {
            const { fundingId, itemId, userName } = req.query;
            let result;

            if (fundingId)
                result = await fundingModel.searchListByFunding(fundingId);
            else if (itemId)
                result = await fundingModel.searchListByItem(itemId);
            else result = await fundingModel.searchListByUser(userName);

            const resultList = result.map((result) => ({
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
            }));

            return res.status(200).json(resultList);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    searchSupport: async (req, res) => {
        try {
            const { itemId, userName, supportId } = req.query;
            let result;

            if (!itemId && !userName)
                result = await fundingModel.searchSupport();
            else if (itemId) result = await fundingModel.supportByItem(itemId);
            else if (userName)
                result = await fundingModel.supportByUser(userName);
            else result = await fundingModel.supportById(supportId);

            if (!result || result.length === 0)
                return res.status(200).send("Not Found");
            const resultList = await Promise.all(
                result.map(async (result) => {
                    const itemData = await fundingModel.selectItem(result.item_id);
                    const fundingName = await fundingModel.fundingById(itemData.funding_id);
                    return {
                        supportId: result.support_id,
                        itemId: result.item_id,
                        userName: result.user_name,
                        amount: result.amount,
                        count: result.count,
                        createdAt: result.created_at,
                        itemName: itemData.item_name,
                        fundingName: fundingName.title
                    };
                })
            );

            return res.status(200).json(resultList);
        } catch (err) {
            console.error(err);
            return res.status(500).send("펀딩 조회 중 오류 발생");
        }
    },

    bookMark: async (req, res) => {
        const { userName, fundingId } = req.body;

        if (!userName || !fundingId)
            return res.status(400).json({ error: "userName and fundingId are required" });

        try {
            const existingBookmark = await fundingModel.checkBookMark(userName, fundingId);

            if (existingBookmark.length > 0) {
                await fundingModel.deleteBookMark(userName, fundingId);
                return res.status(200).json({ message: "Bookmark removed successfully" });
            } else {
                await fundingModel.createBookMark(userName, fundingId);
                return res.status(200).json({ message: "Bookmark added successfully" });
            }
        } catch (err) {
            return res.status(500).json({ error: "Failed to process bookmark" });
        }
    },
};

module.exports = fundingController;
