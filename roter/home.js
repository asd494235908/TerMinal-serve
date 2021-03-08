const sql = require('../mysql.js')
const dayjs = require('dayjs')


exports.home = function (req, res) {
    const str = `SELECT * FROM users`
    const sql1 = sql.Select_Mysql_Data(str)
    sql1.then((data) => {
        const userNmun = data.length
        const str2 = `SELECT * FROM orderdate ORDER BY play_time`
        const sql2 = sql.Select_Mysql_Data(str2)
        sql2.then((data2) => {

            let newData = data2.filter(item => item.type !== 0)
            let arr = [], price = []

            newData.forEach(item => {
                if (item.play_time === null) {
                    return
                }
                item.play_time = dayjs(item.play_time).format('MM-DD')

                if (arr.indexOf(item.play_time) === -1) {
                    arr.push(item.play_time)
                    price.push(item.pirce)
                } else {
                    const num = arr.indexOf(item.play_time)
                    price[num] = Number(price[num]) + Number(item.pirce)
                }
            })


            const orderNum = data2.length
            const str3 = `SELECT * FROM suplist`
            const sql3 = sql.Select_Mysql_Data(str3)
            sql3.then((data3) => {
                const supNum = data3.length
                const str4 = `SELECT * FROM visit_list`
                const sql4 = sql.Select_Mysql_Data(str4)
                sql4.then((data4) => {
                    let visitNum = 0;
                    data4.forEach(item => {
                        visitNum += Number(item.num)
                    })
                    // console.log(arr,price)
                    res.json({
                        cood: 200,
                        success: true,
                        userNmun,
                        orderNum,
                        supNum,
                        visitNum,
                        date: arr,
                        priec: price
                    })
                }).catch(() => {
                    res.json({
                        cood: 400,
                        success: false
                    })
                })
            }).catch(() => {
                res.json({
                    cood: 400,
                    success: false
                })
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false
            })
        })
    }).catch(() => {

        res.json({
            cood: 400,
            success: false
        })
    })
}
exports.getSwiper = function (req, res) {
    const str = 'SELECT * FROM `swiper_img` ORDER BY sort ASC'
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        res.json({
            success: true,
            code: 200,
            data: results
        })
    }).catch(() => {
        res.json({
            success: false,
            code: 400,
        })
    })
}
exports.dellSwiper = function (req, res) {
    const { isadd, data } = req.body
    if (isadd) {
        const str = `INSERT INTO swiper_img(id,img_url,sort,alt,link) VALUES(NULL,'${data.img_url}',${data.sort},'${data.alt}','${data.link}')`
        const sql_a = sql.Insert_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                success: true,
                code: 200
            })
        }).catch(() => {
            res.json({
                success: false,
                code: 400
            })
        })
    } else {
        const str = `UPDATE swiper_img SET img_url='${data.img_url}',sort=${data.sort},alt='${data.alt}',link='${data.link}' WHERE id=${data.id}`
        const sql_b = sql.Up_Mysql_Data(str)
        sql_b.then(() => {
            res.json({
                success: true,
                code: 200
            })
        }).catch(() => {
            res.json({
                success: false,
                code: 400
            })
        })
    }
}
exports.clerSwiper = function (req, res) {
    const { data } = req.body
    const str = `DELETE FROM swiper_img WHERE id=${data.id}`
    const sql_a = sql.Delete_Mysql_Data(str)
    sql_a.then(() => {
        res.json({
            success: true,
            code: 200
        })
    }).catch(() => {
        res.json({
            success: false,
            code: 400
        })
    })
}