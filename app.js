const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const dayjs = require('dayjs')
const http = require('http');
const https = require('https');
const axios = require('axios')
// const server = http.createServer(app);
const fs = require('fs');
//图片验证码
var svgCaptcha = require('svg-captcha');
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
const path = require('path');
const dataBaseOperate = require('./router');
app.use('/serverImage', express.static(path.join(__dirname, 'serverImage')));
const swaggerUi = require('swagger-ui-express'); // swagger包
const options = require('./swagger/swagger.json');
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(options));
const sql = require('./mysql.js'); //引入mysql文件
const home = require('./roter/home.js');
const good = require('./roter/good.js');
const moer = require('./roter/moer.js');
//分页
function pagingtion(page, size, allData) {
    const maxItem = (page - 1) * size;
    const newData = (maxItem + size) > allData.length ? allData.slice(maxItem, allData.length) : allData.slice(maxItem, size + maxItem)
    return newData
}
//删除访问数据
app.post('/api/dellvisitList', (req, res) => {
    moer.dellvisitList(req, res)


})
//获取访问数据
app.post('/api/getvisitList', (req, res) => {
    moer.getvisitList(req, res)
})
//改变黑名单
app.post('/api/changeblacklist', (req, res) => {
    moer.changeblacklist(req, res)

})
//获取用户列表
app.post('/api/getUser', (req, res) => {
    moer.getUser(req, res)


})
//修改用户
app.post('/api/submitUser', (req, res) => {
    moer.submitUser(req, res)
})
//添加图片接口
app.use('/api', dataBaseOperate);
//删除图片接口
app.post('/api/dellImg', (req, res) => {
    moer.dellImg(req, res)
})
//修改图片接口
app.post('/api/subImg', (req, res) => {
    const { isAdd, data } = req.body
    let str;
    if (isAdd) {
        str = `UPDATE upimg SET info='${data.info}' WHERE id=${data.id}`
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

    } else {
        str = `DELETE FROM upimg WHERE id=${data.id}`
        const sql_b = sql.Delete_Mysql_Data(str)
        sql_b.then(() => {
            fs.unlink(`./serverImage/${data.name}`, function (error) {
                if (error) {

                    res.json({
                        cood: 400,
                        success: false,
                    })
                    return false;
                }
                res.json({
                    cood: 200,
                    success: true,
                })
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })

    }

})
//删除订单
app.post('/api/dellOrder', (req, res) => {
    const { id } = req.body
    const str = `DELETE FROM orderdate WHERE oder_id=${id}`
    const str1 = `DELETE FROM order_list WHERE oder_id=${id}`
    const sql_a = sql.Delete_Mysql_Data(str)
    sql_a.then(() => {
        const sql_b = sql.Delete_Mysql_Data(str1)
        sql_b.then(() => {
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
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
})
//改变订单状态
app.post('/api/changeOrderType', (req, res) => {
    const { id } = req.body
    const str = `UPDATE orderdate SET type=2 WHERE oder_id=${id}`
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

})
//获取订单
app.post('/api/orderList', (req, res) => {
    const {
        page, //页数
        size,//一页多少数据
        day1,//查询日期开头
        day2,//查询日期结束
        select,//查询的类型 --列如地址还是电话姓名订单编号--
        value,//查询的内容
        type,
    } = req.body
    let str;
    if (day1 === '' && day2 === '' && select === '' && value === '') {

        str = `SELECT * FROM orderdate ORDER BY time DESC`
    } else if (day1 === '' && day2 === '') {

        str = `SELECT * FROM orderdate WHERE ${select} LIKE '%${value}%' ORDER BY time DESC`
    }
    else {
        str = `SELECT * FROM orderdate WHERE time BETWEEN '${day1}' AND '${day2}' ORDER BY time DESC`
    }
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let order = results

        const str1 = `SELECT * FROM order_list`
        const sql_b = sql.Select_Mysql_Data(str1)
        sql_b.then((resultsb) => {
            let order_list = resultsb
            order.forEach(item => {
                if (!item.data_list) {
                    item.data_list = []
                }
                item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')
                order_list.forEach(list => {
                    if (item.oder_id === list.oder_id) {
                        item.data_list.push(list)
                    }
                })
            })
            let arr = []
            if (type === "") {
                arr = pagingtion(page, size, order)
                res.json({
                    cood: 200,
                    success: true,
                    data: arr,
                    allData: order.length
                })
                return
            } else {
                order.forEach((item, index) => {
                    if (item.type === Number(type)) {
                        arr.push(item)
                    }
                })
                const arrlength = arr.length
                arr = pagingtion(page, size, arr)

                res.json({
                    cood: 200,
                    success: true,
                    data: arr,
                    allData: arrlength
                })
            }
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
})
//获取图片信息接口
app.post('/api/getimgs', (req, res) => {
    moer.getimgs(req, res)

})
app.post('/api/submitSup', (req, res) => {
    good.submitSup(req, res)
})
app.get('/api/modifygood', (req, res) => {
    good.modifygood(req, res)

})
app.post('/api/dellData', (req, res) => {
    const { data } = req.body
    const dataAll = data.list.map(item => {
        return new Promise((resolve, reject) => {
            const itemAll = item.dtail_list.map(o => {
                return new Promise((ru, rj) => {
                    const str = `DELETE FROM nav_list_dtail WHERE id=${o.id}`
                    const sql_a = sql.Delete_Mysql_Data(str)
                    sql_a.then(() => { ru() }).catch(rj(new Error('dtail_list' + o)))
                })
            })
            Promise.all(itemAll).then(() => { resolve() }).catch(err => {
                console.log(err)
                reject(err)
            })
        })
    })
    Promise.all(dataAll).then(() => {
        const str = `DELETE FROM nav WHERE id=${data.id}`
        const sql_c = sql.Delete_Mysql_Data(str)
        sql_c.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }).catch(err => {
        console.log(err)
        res.json({
            cood: 400,
            success: false,
        })

    })


})
app.post('/api/addNav', (req, res) => {
    const { isListAdd, data } = req.body
    if (isListAdd) {
        const str = `INSERT INTO nav(id, name, img, nav_link, nav_id) VALUES(NULL, '${data.name}', '${data.img}', '${data.nav_link}',${data.nav_id})`
        const sql_a = sql.Insert_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })

    } else {
        const str = `UPDATE nav SET name='${data.name}', img='${data.img}', nav_link='${data.nav_link}',nav_id=${data.nav_id} WHERE id=${data.id}`
        const sql_b = sql.Insert_Mysql_Data(str)
        sql_b.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }
})
app.post('/api/dellList', (req, res) => {
    const { data } = req.body
    const { dtail_list } = data
    const dataAll = data_list.map(item => {
        return new Promise((resolve, reject) => {
            const str = `DELETE FROM nav_list_dtail WHERE id=${item.id}`
            const sql_a = sql.Delete_Mysql_Data(str)
            sql_a.then(() => { resolve() }).catch(() => { reject(new Error('DELETE')) })
        })
    })
    Promise.all(dataAll).then(() => {
        const str = `DELETE FROM nav_list WHERE id=${data.id}`
        const sql_b = sql.Delete_Mysql_Data(str)
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
    }).catch((err) => {
        console.log(err)
        res.json({
            cood: 400,
            success: false,
        })
    })
})
app.post('/api/dellListDetail', (req, res) => {
    const { data } = req.body
    const str = `DELETE FROM nav_list_dtail WHERE id=${data.id}`
    const sql_a = sql.Delete_Mysql_Data(str)
    sql_a.then(() => {
        res.json({
            success: true,
            code: 200
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })

})
app.post('/api/submitlistDtail', (req, res) => {
    const { isListAdd_detail, data } = req.body
    if (isListAdd_detail) {
        const str = `INSERT INTO nav_list_dtail(id, name, img, search, dtail_id) VALUES(NULL, '${data.name}', '${data.img}', '${data.search}', ${data.dtail_id})`
        const sql_a = sql.Insert_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })

    } else {
        const str = `UPDATE nav_list_dtail SET name='${data.name}',img='${data.img}',search='${data.search}',dtail_id=${data.dtail_id} WHERE id=${data.id}`
        const sql_a = sql.Up_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }
})
app.post('/api/submitlist', (req, res) => {
    const { isListAdd, data } = req.body
    if (isListAdd) {
        const str = `INSERT INTO nav_list(id, list_name, nav_id, dtail_id) VALUES(NULL, '${data.list_name}', ${data.nav_id}, ${data.dtail_id})`
        const sql_a = sql.Insert_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    } else {
        const str = `UPDATE nav_list SET list_name=${data.list_name} WHERE id=${data.id}`
        const sql_a = sql.Up_Mysql_Data(str)
        sql_a.then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }
})
app.get('/api/getNavId', (req, res) => {
    const str = `select MAX(nav_id)FROM nav_list`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        const str1 = `select MAX(dtail_id)FROM nav_list`
        const sql_b = sql.Select_Mysql_Data(str1)
        sql_b.then((resultsa) => {
            let id;
            for (let i in results[0]) {
                id = results[0][i]
            }
            let ids;
            for (let i in resultsa[0]) {
                ids = resultsa[0][i]
            }
            res.json({
                cood: 200,
                success: true,
                nav_id: id,
                dtail_id: ids,
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })

})
app.get('/api/navData', (req, res) => {
    const str = `SELECT * FROM nav`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        const str1 = `SELECT * FROM nav_list`
        const sql_b = sql.Select_Mysql_Data(str1)
        sql_b.then(results1 => {
            const str2 = `SELECT * FROM nav_list_dtail`
            const sql_c = sql.Select_Mysql_Data(str2)
            sql_c.then((results2) => {
                results1.forEach(element => {
                    element.dtail_list = []
                    results2.forEach(item => {
                        if (element.dtail_id === item.dtail_id) {
                            element.dtail_list.push(item)
                        }
                    })
                });
                results.forEach(element => {
                    element.list = []
                    results1.forEach(item => {
                        if (element.nav_id === item.nav_id) {
                            element.list.push(item)
                        }
                    })
                });
                res.json({
                    success: true,
                    code: 200,
                    data: results
                })
            }).catch(() => {
                res.json({
                    cood: 400,
                    success: false,
                })
            })
        }).catch(() => {
            res.json({
                cood: 400,
                success: false,
            })
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
})
app.post('/api/clerSwiper', (req, res) => {
    home.clerSwiper(req, res)

})
app.post('/api/dellSwiper', (req, res) => {
    home.dellSwiper(req, res)
})
// 删除热门板块
app.post('/api/dellHot', (req, res) => {
    const { data } = req.body
    const str = `UPDATE sup SET hot_id=NULL WHERE hot_id=${data.hot_id}`
    const sql_a = sql.Up_Mysql_Data(str)
    sql_a.then(() => {
        const b = `DELETE FROM hot_surface WHERE id='${data.id}'`
        const sql_b = sql.Delete_Mysql_Data(b)
        sql_b.then(() => {
            res.json({
                cood: 200,
                success: true
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



})
// 获取轮播图
app.post('/api/getSwiper', (req, res) => {
    home.getSwiper(req, res)


})
//添加修改 分类板块
app.post('/api/addHotList', (req, res) => {
    const { isAdd, data } = req.body
    if (isAdd) {
        const { listArr } = data
        const listArrAll = listArr.map(item => {
            return new Promise((ru, rj) => {
                const sentence = `UPDATE sup SET hot_id=${data.hot_id} WHERE id=${item.id}`
                const sql_a = sql.Up_Mysql_Data(sentence)
                sql_a.then(() => { ru() }).catch(() => { rj(new Error('sup err')) })
            })
        })
        Promise.all(listArrAll).then(() => {
            const str = `INSERT INTO hot_surface(id, type, activity, activity_ative, hot_img, hot_id, sort) VALUES(NULL, '${data.type}', '${data.activity}', '${data.activity_ative}', '${data.hot_img}', '${data.hot_id}','${data.sort}')`
            const sql_b = sql.Insert_Mysql_Data(str)
            sql_b.then(() => {
                res.json({
                    cood: 200,
                    success: true
                })
            }).catch(() => {
                res.json({
                    cood: 400,
                    success: false
                })
            })

        }).catch((err) => {
            console.log(err)
            res.json({
                cood: 400,
                success: false
            })
        })
    } else {
        const { listArr } = data
        const str = `UPDATE sup SET hot_id=NULL WHERE hot_id=${data.hot_id}`
        const sql_a = sql.Up_Mysql_Data(str)
        sql_a.then(() => {
            const listArrAll = listArr.map(item => {
                return new Promise((ru, rj) => {
                    const sentence = `UPDATE sup SET hot_id=${data.hot_id} WHERE id=${item.id}`
                    const sql_a = sql.Up_Mysql_Data(sentence)
                    sql_a.then(() => { ru() }).catch(() => { rj(new Error('sup err')) })
                })
            })
            Promise.all(listArrAll).then(() => {
                const str = `UPDATE hot_surface SET activity='${data.activity}',activity_ative='${data.activity_ative}',sort=${data.sort},hot_img='${data.hot_img}' WHERE id=${data.id}`
                const sql_b = sql.Up_Mysql_Data(str)
                sql_b.then(() => {
                    res.json({
                        cood: 200,
                        success: true
                    })
                }).catch(() => {
                    res.json({
                        cood: 400,
                        success: false
                    })
                })

            }).catch((err) => {
                console.log(err)
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
})
//获取 商品信息 sup
app.post('/api/getSupList', (req, res) => {
    const str = `SELECT * FROM sup`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        res.json({
            sucss: true,
            code: 200,
            data: results
        })
    }).catch(() => {
        res.json({
            sucss: false,
            code: 400
        })
    })
})
//添加 修改分类板块
app.post('/api/addClassList', (req, res) => {
    const { isadd, data } = req.body
    if (isadd === false) {
        const { listArr } = data
        const listArrAll = listArr.map(item => {
            return new Promise((ru, rj) => {
                const sentence = `UPDATE hot_list SET hot_name='${item.hot_name}',hot_id=${item.hot_id},hot_link='${item.hot_link}',img='${item.img}',icon='${item.icon}' WHERE id=${item.id}`
                const sql_a = sql.Up_Mysql_Data(sentence)
                sql_a.then(() => { ru() }).catch(() => { rj(new Error('hot_list err')) })
            })
        })
        Promise.all(listArrAll).then(() => {
            const str = `UPDATE hot_surface SET hot_id='${data.hot_id}',type=${data.type},activity='${data.activity}',activity_ative='${data.activity_ative}',sort='${data.sort}',hot_img='${data.hot_img}' WHERE id=${data.id}`
            const sql_b = sql.Up_Mysql_Data(str)
            sql_b.then(() => {
                res.json({
                    cood: 200,
                    success: true
                })
            }).catch(() => {
                res.json({
                    cood: 400,
                    success: false
                })
            })

        }).catch((err) => {
            console.log(err)
            res.json({
                cood: 400,
                success: false
            })
        })

    } else {

        const { listArr } = data
        const listArrAll = listArr.map(item => {
            return new Promise((ru, rj) => {
                const sentence = `INSERT INTO hot_list(id,hot_id,hot_name,hot_link,img,icon)
                        VALUES(NULL,'${item.hot_id}','${item.hot_name}','${item.hot_link}','${item.img}','${item.icon}')`
                const sql_a = sql.Insert_Mysql_Data(sentence)
                sql_a.then(() => { ru() }).catch(() => { rj(new Error('hot_list err')) })
            })
        })
        Promise.all(listArrAll).then(() => {
            const str = `INSERT INTO data.hot_surface(id, type, activity, activity_ative, hot_id, sort) VALUES(NULL,"${data.type}","${data.activity}","${data.activity_ative}","${data.hot_id}","${data.sort}")`
            const sql_b = sql.Insert_Mysql_Data(str)
            sql_b.then(() => {
                res.json({
                    cood: 200,
                    success: true
                })
            }).catch(() => {
                res.json({
                    cood: 400,
                    success: false
                })
            })

        }).catch((err) => {
            console.log(err)
            res.json({
                cood: 400,
                success: false
            })
        })
    }
})
//获得分类板块的编号
app.get('/api/classId', (req, res) => {
    const str = `select MAX(hot_id)FROM hot_surface`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let id;
        for (let i in results[0]) {
            id = results[0][i]
        }
        res.json({
            cood: 200,
            success: true,
            data: id
        })
    }).catch(() => {
        res.json({
            sucss: false,
            code: 400,
        })
    })
})
//获得板块管理的数据
app.post('/api/plate', (req, res) => {
    const str = `SELECT * FROM hot_surface`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((resultsa) => {
        const str = `SELECT * FROM hot_list`
        const sql_b = sql.Select_Mysql_Data(str)
        sql_b.then((resultsb) => {
            resultsa.forEach(element => {
                element.listArr = []
                resultsb.forEach(elementb => {
                    if (element.hot_id === elementb.hot_id) {
                        element.listArr.push(elementb)
                    }
                })
            });
            const str = 'SELECT * FROM sup WHERE hot_id IS NOT NULL'
            const sql_c = sql.Select_Mysql_Data(str)
            sql_c.then((resultsc) => {
                const str = 'SELECT * FROM suplist'
                const sql_d = sql.Select_Mysql_Data(str)
                sql_d.then((resultsd) => {
                    resultsc.forEach(elem => {
                        elem.list = []
                        resultsd.forEach(item => {
                            if (elem.spec_id === item.spec_id) { elem.list.push(item) }
                        })
                    })
                    resultsa.forEach(elem => {
                        resultsc.forEach(item => {
                            if (elem.hot_id === item.hot_id) {
                                elem.listArr.push(item)
                            }
                        })
                    })
                    res.json({
                        sucss: true,
                        code: 200,
                        data: resultsa
                    })
                }).catch(() => {
                    res.json({
                        sucss: false,
                        code: 400,
                    })
                })
            }).catch(() => {
                res.json({
                    sucss: false,
                    code: 400,
                })
            })
        }).catch(() => {
            res.json({
                sucss: false,
                code: 400,
            })
        })
    }).catch(() => {
        res.json({
            sucss: false,
            code: 400,
        })
    })
})
//删除分类板块
app.post('/api/dellClass', (req, res) => {
    const { isadd, data } = req.body
    const a = `DELETE FROM hot_surface WHERE id='${data.id}'`
    const sql_a = sql.Delete_Mysql_Data(a)
    sql_a.then(() => {
        const arr = data.listArr
        const arrAll = arr.map(item => {
            return new Promise((ru, rj) => {
                const b = `DELETE FROM hot_list WHERE id='${item.id}'`
                const sql_b = sql.Delete_Mysql_Data(b)
                sql_b.then(() => { ru() }).catch(() => { rj(new Error('DELETE err' + 'hot_list' + item.id)) })
            })
        })
        Promise.all(arrAll).then(() => {
            res.json({
                cood: 200,
                success: true
            })
        }).catch((err) => {
            console.log(err)
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


})
// 删除商品
app.post('/api/dellItem', (req, res) => {
    good.dellItem(req, res)
})
//登录
app.post('/api/Login', (req, res) => {
    const time = alls(arrnNuber(getTime().match(/\d+/g)))
    const { username, pwd } = req.body.userInfo
    const str = `SELECT * FROM users WHERE username='${username}'`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        if (results[0] === undefined) {
            res.json({
                message: '账号密码有误',
                success: false
            })
            visitLogIn(username, time, req, res)
        } else {
            const { id, username, password, uid, userinfo, add, dell } = results[0]
            if (pwd === password) {
                res.json({
                    token: jwt.sign({ id: id, username: username, uid: uid, userinfo: userinfo, add: add, dell: dell }, 'abcd', {
                        expiresIn: "3000s"
                    }),
                    code: 200,
                    success: true,
                    id,
                    username,
                    uid,
                    userinfo,
                    add,
                    dell
                })
                visitLogIn(username, time, req, res)
            } else {
                res.json({
                    message: '账号密码有误',
                    success: false
                })
                visitLogIn(username, time, req, res)
            }
        }
    }).catch(() => { })
})
// 判断是否为移动设备
function getMachine(req) {
    var deviceAgent = req.headers["user-agent"].toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if (agentID) {
        return "Mobile";
    } else {
        return "PC";
    }
}
//保存访问次数
function visitLogIn(username, time, req, res) {
    const ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/)
    const newtime = alls(arrnNuber(getTime().match(/\d+/g))) // 数组字符串返回数组 数字类型
    const ms = newtime - time
    const name = '后台系统'
    const device = req.headers['user-agent'] //支付设备信息
    const mobile = getMachine(req) // 判断是否为移动设备
    const nowTime = getTime()
    axios({
        url: 'https://www.tianqiapi.com/free/day?appid=47935549&appsecret=wAeXd8yf&ip=' + ip
    }).then(function (result) {
        const city = result.data.city || '未知'
        const str = `SELECT * FROM visit_list WHERE ip LIKE '%${ip}%'`
        const sql_a = sql.Select_Mysql_Data(str)
        sql_a.then((results) => {
            if (results.length !== 0) {
                let letterNum = Number(results[0].num) + 1
                const str2 = `UPDATE visit_list SET ms='${ms}', time='${nowTime}', num=${letterNum} ,mobile='${mobile}', device='${device}'  WHERE ip='${ip}'`
                const sql_b = sql.Up_Mysql_Data(str2)
                sql_b.then(() => { }).catch((err) => { console.log(err) })
            } else {
                const str1 = `INSERT INTO visit_list(id, user, ip, name, ms, time, city, num, mobile, device) VALUES(NULL, '${username}', '${ip}', '${name}','${ms}','${nowTime}','${city}',${1}, '${mobile}', '${device}')`
                const sql_c = sql.Insert_Mysql_Data(str1)
                sql_c.then(() => { }).catch((err) => { console.log(err) })
            }
        }).catch((err) => {
            console.log(err)
        })
    })

}
//返回毫秒
function alls(arr) {
    const oid = new Date()
    oid.setFullYear(arr[0], arr[1], arr[2])
    oid.setHours(arr[3])
    oid.setMinutes(arr[4])
    oid.setSeconds(arr[5])
    return oid.getTime()
}
// 数组字符串返回数组 数字类型
function arrnNuber(x) {
    const arr = []
    for (let i = 0; i < x.length; i++) {
        arr.push(letterNuber(x[i]))
    }
    return arr
}
// 返回数字
function letterNuber(x) {
    const num1 = Number(parseInt(x))
    return num1
}
function getTime() {
    let time = new Date()
    const year = time.getFullYear()
    const Month = time.getMonth() + 1
    const date = time.getDate()
    const Hours = time.getHours()
    const Minutes = time.getMinutes()
    const Seconds = time.getSeconds()
    return `${year}-${towNum(Month)}-${towNum(date)} ${towNum(Hours)}:${towNum(Minutes)}:${towNum(Seconds)}`
}
//返回秒
function alls(arr) {
    const oid = new Date()
    oid.setFullYear(arr[0], arr[1], arr[2])
    return oid.getTime()
}
function towNum(num) {
    return num < 10 ? '0' + num : num
}
//随机颜色
const getRandomColor = function () {
    return '#' +
        (function (color) {
            return (color += '0123456789abcdef'[Math.floor(Math.random() * 16)])
                && (color.length == 6) ? color : arguments.callee(color);
        })('');
}
//登录验证码
app.post('/api/verification', (req, res) => {
    const cap = svgCaptcha.createMathExpr({
        mathMin: 1,
        mathMax: 9,
        noise: 3,
        background: getRandomColor(),
        color: true,
        width: 150,
        height: 36
    })
    res.send(cap);
})
//登录持久化验证
app.post('/api/validate', (req, res) => {
    let token = req.headers.authorization;
    jwt.verify(token, 'abcd', function (err, decode) {
        if (err) {
            res.json({
                msg: '当前用户未登录',
                success: false
            })
        } else {
            // 证明用户已经登录
            res.json({
                token: jwt.sign({
                    id: decode.id,
                    username: decode.username,
                    uid: decode.uid,
                    userinfo: decode.userinfo,
                    add: decode.add,
                    dell: decode.dell
                }, 'abcd', {
                    // 过期时间
                    expiresIn: "12000s"
                }),
                code: 200,
                success: true,
                id: decode.id,
                username: decode.username,
                uid: decode.uid,
                userinfo: decode.userinfo,
                add: decode.add,
                dell: decode.dell
            })
        }
    })
})
//修改商品
app.post('/api/modifyItem', (req, res) => {
    good.modifyItem(req, res)

})
// 删除商品尺寸
app.post('/api/operation', (req, res) => {
    good.operation(req, res)

})
app.post('/api/getGooList', (req, res) => {
    const { index, page, size, value } = req.body
    good.getDataList(res, index, page, size, value)
})
app.post('/api/addSupDetal', (req, res) => {
    console.log(1)
    good.addSupDetal(req, res)

})
app.get('/api/getdetalid', (req, res) => {
    const str = `select MAX(detal_id)FROM suplist`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let id;
        for (let i in results[0]) {
            id = results[0][i]
        }
        res.json({
            cood: 200,
            success: true,
            data: id
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
})
app.get('/api/getspecid', (req, res) => {
    const str = `select MAX(spec_id)FROM sup`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((results) => {
        let id;
        for (let i in results[0]) {
            id = results[0][i]
        }
        res.json({
            cood: 200,
            success: true,
            data: id
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false,
        })
    })
})
app.post('/api/priceData', (req, res) => {
    let { day1, day2 } = req.body
    let newday1 = day1.split('-'),
        newday2 = day2.split('-');
    let olddata = alls(newday1),
        newdata = alls(newday2)
    const day = (newdata - olddata) / 86400000
    let dataStr;
    if (day >= 365) {
        dataStr = 'YYYY-MM-DD'
    } else {
        dataStr = 'MM-DD'
    }
    const str = `SELECT * FROM orderdate WHERE play_time BETWEEN '${day1}' AND '${day2}' ORDER BY play_time`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((data) => {
        let newData = data.filter(item => item.type !== 0)
        let arr = [], price = []
        newData.forEach(item => {
            item.play_time = dayjs(item.play_time).format(dataStr)
            if (arr.indexOf(item.play_time) === -1) {
                arr.push(item.play_time)
                price.push(item.pirce)
            } else {
                const num = arr.indexOf(item.play_time)
                price[num] = Number(price[num]) + Number(item.pirce)
            }
        })
        res.json({
            cood: 200,
            success: true,
            date: arr,
            priec: price
        })
    })
        .catch(() => {
            res.json({
                cood: 400,
                success: false
            })
        })
})
app.get('/api/home', (req, res) => {
    home.home(req, res)
})
app.post('/api/addDeta', (req, res) => {
    good.addDeta(req, res)

})
setInterval(() => {
    const str = `select MAX(spec_id)FROM sup`
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((a) => {
        console.log(a)
     }).catch(() => { })
}, 1000);
app.listen(3010)
//证书
// let key = fs.readFileSync('ssl/4765496_www.dcmaomi.com.key', 'utf8'),
//     cert = fs.readFileSync('ssl/4765496_www.dcmaomi.com.pem', 'utf8');
// let credentials = { key, cert };

// let server = https.createServer(credentials, app);

// server.listen(3010, '0.0.0.0');