const sql = require('../mysql.js')
const components = require('../components/components.js')
const dayjs = require('dayjs')
const fs = require('fs');
exports.dellvisitList = function (req, res) {
    const { arr } = req.body
    const arrs = arr.map(item => {
        return new Promise((resolve, reject) => {
            const str = `DELETE FROM visit_list WHERE id=${item}`
            const sql_a = sql.Delete_Mysql_Data(str)
            sql_a.then(() => { resolve() }).catch(() => { reject(new Error('visit_lists删除失败')) })
        })
    })
    Promise.all(arrs).then(() => {
        res.json({
            cood: 200,
            success: true,
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
}
exports.getvisitList = function (req, res) {
    const { value, size, page, day1, day2, select, index } = req.body
    let order, ms, num;
    switch (index) {
        case 1:
            ms = 'id'
            order = 'ASC'
            break;
        case 2:
            ms = 'id'
            order = 'DESC'
            break;
        case 3:
            ms = 'time'
            order = 'ASC'
            break;
        case 4:
            ms = 'time'
            order = 'DESC'
            break;
        case 5:
            ms = 'ms'
            order = 'ASC'
            break;
        case 6:
            ms = 'ms'
            order = 'DESC'
            break;

    }
    if (day1 === '' && day2 === '' && select === '' && value === '') {

        str = `SELECT * FROM visit_list  ORDER BY ${ms} ${order} `
    } else if (day1 === '' && day2 === '') {

        str = `SELECT * FROM visit_list WHERE ${select} LIKE '%${value}%'  ORDER BY ${ms} ${order}`
    }
    else {
        str = `SELECT * FROM visit_list WHERE time BETWEEN '${day1}' AND '${day2}' ORDER BY ${ms} ${order}`
    }
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let data = components.pagingtion(page, size, results)
        data.forEach(item => {
            item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')
        })
        res.json({
            cood: 200,
            success: true,
            data: data,
            maxData: results.length
        })
    }).catch(() => { })
}
exports.getUser = function (req, res) {
    const {
        page, //页数
        size,//一页多少数据
        day1,//查询日期开头
        day2,//查询日期结束
        select,//查询的类型 --列如地址还是电话姓名订单编号--
        value,//查询的内容
        blacklist,//黑名单
    } = req.body
    let str;
    if (!blacklist) {
        if (day1 === '' && day2 === '' && select === '' && value === '') {

            str = `SELECT * FROM users  ORDER BY uid ASC `
        } else if (day1 === '' && day2 === '') {

            str = `SELECT * FROM users WHERE ${select} LIKE '%${value}%'  ORDER BY uid ASC`
        }
        else {
            str = `SELECT * FROM users WHERE user_time BETWEEN '${day1}' AND '${day2}' ORDER BY user_time DESC`
        }
    } else {
        if (day1 === '' && day2 === '' && select === '' && value === '') {

            str = `SELECT * FROM users WHERE blacklist=1 ORDER BY uid ASC`
        } else if (day1 === '' && day2 === '') {

            str = `SELECT * FROM users WHERE ${select} LIKE '%${value}%' ORDER BY uid ASC `
        }
        else {
            str = `SELECT * FROM users WHERE user_time BETWEEN '${day1}' AND '${day2}' ORDER BY user_time DESC`
        }
    }

    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        if (!blacklist) {
            results = results.filter(item => {
                return item.blacklist !== 1
            })
        } else {
            results = results.filter(item => {
                return item.blacklist !== 0
            })
        }
        let data = components.pagingtion(page, size, results)
        res.json({
            cood: 200,
            success: true,
            data: data,
            maxData: results.length
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false
        })
    })
}
exports.submitUser = function (req, res) {
    const { data } = req.body
    const str = `UPDATE users SET username='${data.username}',password='${data.password}',uid=${data.uid},isadd=${data.isadd},dell=${data.dell},userinfo='${data.userinfo}',user_name='${data.user_name}',user_img='${data.user_img}',sex='${data.sex}',user_autograph='${data.user_autograph}',user_time='${data.user_time}' WHERE id=${data.id}`
    const sql_a = sql.Up_Mysql_Data(str)
    sql_a.then(() => {
        res.json({
            cood: 200,
            success: true,
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })

}
exports.changeblacklist = function (req, res) {
    const { id, x } = req.body
    let str;
    if (x) {
        str = `UPDATE users SET blacklist=1 WHERE id=${id}`
    } else {
        str = `UPDATE users SET blacklist=0 WHERE id=${id}`
    }
    const sql_a = sql.Up_Mysql_Data(str)
    sql_a.then(() => {
        res.json({
            cood: 200,
            success: true,
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })


}
exports.getimgs = function (req, res) {
    const { value,
        size,
        page,
        day1,
        day2, is, } = req.body
        
    let str;
    if (value === '' && day1 === '' && day2 === '') {
        str = `SELECT * FROM upimg ORDER BY time DESC`
    } else if (value === '' && day1 !== '' && day2 !== '') {
        str = `SELECT * FROM upimg WHERE time BETWEEN '${day1}' AND '${day2}' ORDER BY time DESC`
    } else if (value !== '' && day1 === '' && day2 === '') {
        str = `SELECT * FROM upimg WHERE info LIKE '%${value}%' ORDER BY time DESC`
    }
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let data = results
        data.forEach(item => {
            item.time = dayjs(item.time).format('YYYY-MM-DD')
        })
        if (is !== 2) {
            data = components.pagingtion2(page, size, data)
        } else {
            data = components.pagingtion(page, size, data)
        }
        res.json({
            cood: 200,
            success: true,
            data,
            max: results.length
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false
        })
    })
}
exports.dellImg = function (req, res) {
    const { arr } = req.body
    const arrs = arr.map(item => {
        return new Promise((resolve, reject) => {
            const str = `DELETE FROM upimg WHERE id=${item.id}`
            const sql_a = sql.Delete_Mysql_Data(str)
            sql_a.then(() => {
                fs.unlink(`../serverImage/${item.name}`, function (error) {
                    if (error) {
                        return reject(new Error('删除图片失败'));
                    }
                    resolve()
                })
            }).catch(() => { 
                reject(new Error('链接失败'))
            })
        })
    })
    arr.forEach((item, index) => {
        let str = `DELETE FROM upimg WHERE id=${item.id}`
        mysqlSentenceb(str)

        if (index === arr.length - 1) {
            res.json({
                cood: 200,
                success: true,
            })
        }
    })
}