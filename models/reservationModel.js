const db = require("../config/mysqlDatabase");

// ------- GET Query -------
const search_userWait_query = "SELECT * FROM wait_list WHERE user_name = ?";
const search_storeWait_query = "SELECT * FROM wait_list WHERE store_id = ? AND status = 'pending' ORDER BY created_at ASC";
const waitPosition_query = 'SELECT *, (SELECT COUNT(*) FROM wait_list AS wl WHERE wl.store_id = wait_list.store_id AND wl.status = "pending" AND wl.created_at <= wait_list.created_at) AS position FROM wait_list WHERE user_name = ? AND store_id = ? AND status = "pending" ORDER BY created_at ASC';
const get_reservationtime_query = 'SELECT * FROM wait_list WHERE created_at <= NOW() AND status = "pending"';
const getReservationUser_query = 'SELECT * FROM reservation WHERE user_name = ? ORDER BY reservation_date ASC, reservation_time ASC';
const reservationStatus_query = 'SELECT * FROM store_capacity WHERE store_id = ?';
const storeEndDate_query = 'SELECT store_end_date FROM popup_stores WHERE store_id = ?';
const storeSchedules_query = 'SELECT * FROM store_schedules WHERE store_id = ?';
const checkCapacity_query = 'SELECT max_capacity, current_capacity FROM store_capacity WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';
const maxCapacity_query = 'SELECT max_capacity FROM popup_stores WHERE store_id = ?';
const getStoreName_query = 'SELECT store_name FROM popup_stores WHERE store_id = ?';
const getReservationPresident_query = 'SELECT * FROM reservation WHERE store_id = ? ORDER BY reservation_date ASC, reservation_time ASC';
const getcapacityByReservationId_query = 'SELECT * FROM reservation WHERE reservation_id = ?';
const getUserName_query = 'SELECT * FROM reservation WHERE reservation_id = ?';
const checkStatusForReservation_query = 'SELECT * FROM reservation WHERE user_name = ? AND store_id = ? AND reservation_status = "pending"';
const checkStatusForWaitList_query = 'SELECT * FROM wait_list WHERE user_name = ? AND store_id = ? AND status = "pending"';
const checkStatusReservation_query = 'SELECT reservation_status FROM reservation WHERE reservation_status = "pending" AND reservation_id = ?';
const getUserWaitList_query = 'SELECT * FROM wait_list WHERE reservation_id =?';
const checkStatusWaitList_query = 'SELECT * FROM wait_list WHERE status = "pending" AND reservation_id = ?';

// ------- POST Query -------
const insert_wait_query = "INSERT INTO wait_list SET ?";
const insert_stand_query = "INSERT INTO stand_store(user_name, store_id) VALUES (?, ?)";
const reservation_query = 'INSERT INTO reservation SET ?';
const storeCapacity_query = 'INSERT INTO store_capacity SET ?';

// ------- PUT Query -------
const admission_wait_query = 'UPDATE wait_list SET status = "completed" WHERE reservation_id = ?';
const updateCapacity_query = 'UPDATE store_capacity SET current_capacity = ? WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';
const completedReservation_query = 'UPDATE reservation SET reservation_status = ? WHERE reservation_id = ?';
const updateCapacityMinus_query = 'UPDATE store_capacity SET current_capacity = current_capacity - ? WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';

// ------- DELETE Query -------
const delete_wait_query = 'DELETE FROM wait_list WHERE reservation_id = ?';
const deleteReservation_query = 'DELETE FROM reservation WHERE reservation_id = ?';


const reservationModel = {
    // 예약 상태
    reservationStatus: async (store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(reservationStatus_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (!results.length) {
                return { message: "현재 예약 정보가 없습니다." };
            }

            const date = await new Promise((resolve, reject) => {
                db.query(storeEndDate_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            });

            const day = await new Promise((resolve, reject) => {
                db.query(storeSchedules_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })

            const common = {
                store_id: results[0].store_id,
                max_capacity: results[0].max_capacity,
                store_end_date: date[0].store_end_date,
                day: day.map(({ schedule_id, store_id, ...dayData }) => dayData)
            };

            const status = results.map(({ max_capacity, store_id, ...rest }) => {
                rest.status = rest.current_capacity >= common.max_capacity;
                return rest;
            });

            return { common, status };

        } catch (err) {
            throw err;
        }
    },

    // 사전 예약 확인
    checkStatusForReservation: async (user_name, store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(checkStatusForReservation_query, [user_name, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })
            if (results.length > 0) { return { success: false }; } // 예약 O => 신청 X
            else { return { success: true }; } // 예약 X => 신청 O
        } catch (err) {
            throw err;
        }
    },

    // 예약
    reservation: async (reservationData) => {
        try {
            const { store_id, reservation_date, reservation_time, capacity } = reservationData;
            const check = await new Promise((resolve, reject) => { // store_capacity에 값이 있는지 확인
                db.query(checkCapacity_query, [store_id, reservation_date, reservation_time], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })

            const popup_capacity = await new Promise((resolve, reject) => {
                db.query(maxCapacity_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const current_capacity = check.length > 0 ? parseInt(check[0].current_capacity, 10) : 0;
            const max_capacity = popup_capacity[0].max_capacity;
            const update_capacity = current_capacity + parseInt(reservationData.capacity, 0);

            if (update_capacity <= max_capacity) {

                await new Promise((resolve, reject) => {
                    db.query(reservation_query, reservationData, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                if (check.length === 0) { // store_capacity에 값이 없는 경우,
                    const capacityData = {
                        store_id,
                        reservation_date,
                        reservation_time,
                        max_capacity,
                        current_capacity: capacity
                    };

                    await new Promise((resolve, reject) => {
                        db.query(storeCapacity_query, capacityData, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });

                } else {
                    await new Promise((resolve, reject) => {
                        db.query(updateCapacity_query, [update_capacity, store_id, reservation_date, reservation_time], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                };
                return { success: true, update_capacity, max_capacity };
            } else {
                return { success: false, update_capacity, max_capacity };
            }

        } catch (err) {
            throw err;
        }
    },

    // 유저별 예약 조회
    getReservationUser: async (user_name) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(getReservationUser_query, user_name, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (results.length === 0) {
                return '예약 정보가 없습니다.';
            }

            const reservation = await Promise.all(results.map(async (data) => {
                const store_name = await new Promise((resolve, reject) => {
                    db.query(getStoreName_query, [data.store_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result.map(name => name.store_name)[0]);
                    });
                });
                return {
                    ...data,
                    store_name
                };
            }));

            return reservation;

        } catch (err) {
            throw err;
        }
    },

    // 스토어별 예약 조회
    getReservationPresident: async (store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(getReservationPresident_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (results.length === 0) {
                return '예약 정보가 없습니다.';
            }

            return results;
        } catch (err) {
            throw err;
        }
    },

    // 사전 예약 수락
    completedReservation: async (reservation_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(completedReservation_query, ["completed", reservation_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            });

            const user = await new Promise((resolve, reject) => {
                db.query(getUserName_query, reservation_id, (err, result) => {
                    if (err) reject(err);
                    else {
                        if (result.length > 0) {
                            resolve(result);
                        } else {
                            resolve(null);
                        }
                    }
                })
            });

            return user;

        } catch (err) {
            throw err;
        }
    },

    // 예약 취소
    deleteReservation: async (reservation_id) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(checkStatusReservation_query, reservation_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result.length);
                })
            })

            if (check === 0) { // 취소 불가
                return check;
            } else {
                const getCapacity = await new Promise((resolve, reject) => {
                    db.query(getcapacityByReservationId_query, reservation_id, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                const { store_id, reservation_date, reservation_time, capacity } = getCapacity[0];

                await new Promise((resolve, reject) => {
                    db.query(updateCapacityMinus_query, [capacity, store_id, reservation_date, reservation_time], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(deleteReservation_query, reservation_id, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    })
                });
            }

        } catch (err) {
            throw err;
        }

    },

    searchUserWait: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(search_userWait_query, userName, async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    searchStoreWait: (store_id) => {
        return new Promise((resolve, reject) => {
            db.query(search_storeWait_query, store_id, async (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    checkStatusForWaitList: async (user_name, store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(checkStatusForWaitList_query, [user_name, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })
            if (results.length > 0) { return { success: false }; } // 예약 O => 신청 X
            else { return { success: true }; } // 예약 X => 신청 O
        } catch (err) {
            throw err;
        }
    },

    createWaitList: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(insert_wait_query, insertData, async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    admissionWaitList: async (reservation_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(admission_wait_query, reservation_id, async (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const user = await new Promise((resolve, reject) => {
                db.query(getUserWaitList_query, reservation_id, (err, result) => {
                    if (err) reject(err);
                    else {
                        if (result.length > 0) {
                            resolve(result);
                        } else {
                            resolve(null);
                        }
                    }
                })
            });

            return user;
        } catch (err) {

        }

    },

    createStand: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(
                insert_stand_query,
                [insertData.user_name, insertData.store_id],
                async (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                }
            );
        });
    },

    searchUserStoreWait: (userName, storeId) => {
        return new Promise((resolve, reject) => {
            db.query(waitPosition_query, [userName, storeId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            }
            );
        });
    },

    cancelWaitList: async (reservation_id) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(checkStatusWaitList_query, reservation_id, (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length);
                });
            });

            if (check === 0) {
                return check;
            } else {
                await new Promise((resolve, reject) => {
                    db.query(delete_wait_query, reservation_id, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            }
        } catch (err) {
            throw err;
        }
    },

    getDueReservations: () => {
        return new Promise((resolve, reject) => {
            db.query(get_reservationtime_query, async (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
};

module.exports = reservationModel;
