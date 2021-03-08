const sql = require('../mysql.js')
const dayjs = require('dayjs')
const components = require('../components/components.js')
function mysqlSentence(a, res, callBack) {
    const str = a;
    connection.query(str, function (error, results, fields) {
        if (error) throw error;
        if (typeof callBack === 'function') {
            callBack()
        } else {
            if (res) {
                res.json({
                    cood: 200,
                    success: true
                })
            }
        }
    });

}
// 存入sup表
function uploadSup(item, item2, req, res) {
    const str = `INSERT INTO sup(id,spu_title,spu_sub_title,spu_sub_title_hover,spu_defall_show,spec_id,search,price) VALUES(NULL,"${item.spu_title}","${item.spu_sub_title}","${item.spu_sub_title_hover}","${item.spu_defall_show}",${item.spec_id},"${item.search}",${item.price})`
    const sql_a = sql.Insert_Mysql_Data(str);
    sql_a.then(() => {
        uploadSupList(item, item2, req, res)
    })
        .catch(() => { })

}
//存入suplist表
function uploadSupList(items, arr, req, res) {
    if (arr.length === 0) return
    const dataLL = arr.map((item) => {
        return new Promise((resolve, reject) => {
            const str = `INSERT INTO suplist(id,spec_id,spu_title,show_img,show_name,price,oldprice,img_url1,
    img_url2,img_url3,img_url4,img_url5) VALUES(NULL,"${item.spec_id}","${item.spu_title}","${item.showName}",
    "${item.color}","${Number(item.price)}","${Number(item.oldPrice)}","${item.img1 === "" ? "NULL" : item.img1}",
    "${item.img2 === "" ? "NULL" : item.img2}","${item.img3 === "" ? "NULL" : item.img3}","${item.img4 === "" ? "NULL" : item.img4}","${item.img5 === "" ? "NULL" : item.img5}")`
            const sql_b = sql.Insert_Mysql_Data(str)
            sql_b.then((a) => {
                resolve('suplist success')
            }).catch(() => {
                reject(new Error("失败"))
            })
        })
    })
    //存入suplistimg表
    Promise.all(dataLL).then((a) => {
        const str = `INSERT INTO suplistimg(spec_id,list_url,spu_title)
        VALUES("${items.spec_id}","${items.imglist}","${items.spu_title}")`
        const sql_c = sql.Insert_Mysql_Data(str)
        sql_c.then(() => {
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
    }).catch((a) => {
        console.log(a)
        res.json({
            cood: 400,
            success: false
        })
    })

}
exports.addDeta = function (req, res) {
    const { dataTitel, dataList } = req.body
    uploadSup(dataTitel, dataList, req, res)

}
exports.submitSup = function (req, res) {
    const { data } = req.body
    console.log(data)
    const str = `UPDATE sup SET spu_title='${data.spu_title}',spu_sub_title='${data.spu_sub_title}',spu_sub_title_hover='${data.spu_sub_title_hover}',spu_defall_show=${data.spu_defall_show === "" ? 'Null' : data.spu_defall_show},spec_id=${data.spec_id},hot_id=${data.hot_id === null ? 'Null' : data.hot_id},search='${data.search}',price=${data.price} WHERE id=${data.id}`
    const sql_a = sql.Up_Mysql_Data(str)
    sql_a.then(() => {
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

}
exports.modifygood = function (req, res) {
    const { id, page, size, value } = req.query
    let srt = "";
    if (id == 1) {
        str = `SELECT * FROM sup WHERE search LIKE '%${value}%' ORDER BY spec_id ASC`
    } else if (id == 2) {
        str = `SELECT * FROM sup WHERE search LIKE '%${value}%' ORDER BY spec_id DESC`
    } else if (id == 3) {
        str = `SELECT * FROM sup WHERE search LIKE '%${value}%' ORDER BY price ASC`
    } else if (id == 4) {
        str = `SELECT * FROM sup WHERE search LIKE '%${value}%' ORDER BY price DESC`
    } else {
        str = `SELECT * FROM sup WHERE search LIKE '%${value}%'`
    }
    const sal_a = sql.Select_Mysql_Data(str)
    sal_a.then((results) => {
        let data = components.pagingtion(Number(page), Number(size), results)
        res.json({
            cood: 200,
            success: true,
            data,
            maxData: results.length
        })
    }).catch(() => {
        res.json({
            cood: 400,
            success: false
        })
    })
}
exports.operation = function (req, res) {
    const { type, data } = req.body
    console.log(type, data)
    //tyep 为0 的是修改， type为1的是为删除
    if (type === 0) {
        const sentence = `UPDATE supdetail SET detal_id=${data.detal_id},price=${data.price === null ? "NULL" : data.price},size='${data.size}',img='${data.img}' WHERE id=${data.id}`
        // mysqlSentence(sentence, res)
        const sql_a = sql.Up_Mysql_Data(sentence)
        sql_a.then(() => {
            if (res) {
                res.json({
                    cood: 200,
                    success: true
                })
            }
        }).catch(() => {
            res.json({
                cood: 400,
                success: false
            })
        })
    } else if (type === 1) {
        const { sizeLngth, sizeList } = data
        // sizeLngth = ture是删除的最后一个 要把上级表的dtal_id设置为NUll
        if (sizeLngth) {
            // 要把上级表的dtal_id设置为NUll
            const sentence = `DELETE FROM supdetail WHERE id=${sizeList.id}`
            const sql_b = sql.Delete_Mysql_Data(sentence)
            sql_b.then(() => {
                const str = `UPDATE suplist SET detal_id=NULL WHERE detal_id=${sizeList.detal_id}`
                const sql_c = sql.Up_Mysql_Data(str)
                sql_c.then(() => {
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
        } else {
            //不要把上级表的dtal_id设置为NUll
            const sentence = `DELETE FROM supdetail WHERE id=${sizeList.id}`
            const sql_d = sql.Delete_Mysql_Data(sentence)
            sql_d.then(() => {
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
        }
    }
}
exports.addSupDetal = function (req, res) {
    const { id, detalId, dataDtal } = req.body
    const str = `UPDATE suplist SET detal_id=${detalId} WHERE id=${id}`
    const sql_a = sql.Up_Mysql_Data(str)
    sql_a.then(() => {
        const dataDatalAll = dataDtal.map(item => {
            return new Promise((resolve, reject) => {
                const str = `INSERT INTO supdetail(id,detal_id,price,size,img) VALUES(NULL,"${item.detal_id}","${item.price}","${item.size}","${item.img}")`
                const sql_b = sql.Insert_Mysql_Data(str)
                sql_b.then(() => {
                    resolve()
                }).catch(() => {
                    reject(new Error('上传失败'))
                })

            })

        })
        Promise.all(dataDatalAll).then(() => {
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
}
exports.dellItem = function (req, res) {
    const { lastItem, data } = req.body
    const size = data.size
    let isDellsize = true
    if (size !== undefined) {
        isDellsize = false
        const sizes = size.map(item => {
            return new Promise((resolve, reject) => {
                const str = `DELETE FROM supdetail WHERE id='${item.id}'`
                const sql_a = sql.Dell_Mysql_Data(str)
                sql_a.then(() => { resolve() }).catch((reject(new Error('删除失败'))))
            })
        })
        Promise.all(sizes).then(() => {
            isDellsize = true
        }).catch((err) => {
            isDellsize = false
            console.log(err)
        })
    }
    if (lastItem === true) {
        const a = `DELETE FROM suplistimg WHERE spec_id='${data.spec_id}'`
        const sql_b = sql.Delete_Mysql_Data(str)
        sql_b.then(() => {
            const sentence = `DELETE FROM suplist WHERE id='${data.id}'`
            const sql_c = sql.Delete_Mysql_Data(sentence)
            sql_c.then(() => {
                const str = `DELETE FROM sup WHERE spec_id='${data.spec_id}'`
                const sql_d = sql.Delete_Mysql_Data(str)
                sql_d.then(() => {
                    if (isDellsize) {
                        res.json({
                            cood: 200,
                            success: true
                        })
                    } else {
                        res.json({
                            cood: 400,
                            success: false
                        })
                    }
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
    } else {
        const sentence = `DELETE FROM suplist WHERE id='${data.id}'`
        const sql_e = sql.Delete_Mysql_Data(sentence)
        sql_e.then(() => {
            if (isDellsize) {
                res.json({
                    cood: 200,
                    success: true
                })
            } else {
                res.json({
                    cood: 400,
                    success: false
                })
            }

        }).catch(() => {
            res.json({
                cood: 400,
                success: false
            })
        })
    }
}
exports.modifyItem = function (req, res) {
    const { data } = req.body

    const sentence = `UPDATE suplist SET spec_id=${data.spec_id},spu_title='${data.spu_title}',show_name='${data.show_name}',price=${data.price === null ? "NULL" : data.price},price=${data.price},oldprice=${data.oldprice},img_url1='${data.img_url1 === null ? "NULL" : data.img_url1}',img_url2='${data.img_url2 === null ? "NULL" : data.img_url2}',img_url3='${data.img_url3 === null ? "NULL" : data.img_url3}',img_url4='${data.img_url4 === null ? "NULL" : data.img_url4}',img_url5='${data.img_url5 === null ? "NULL" : data.img_url5}' WHERE id=${data.id}`
    const sql_a = sql.Up_Mysql_Data(sentence)
    sql_a.then(() => {
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
}
// 获取商品详情列表
exports.getDataList = function getDataList(res, index, page, size, input) {
    let str;
    if (index === 1) {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%' ORDER BY price ASC`
    } else if (index === 2) {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%' ORDER BY price DESC`
    } else if (index === 3) {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%' ORDER BY oldprice ASC`
    } else if (index === 4) {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%' ORDER BY oldprice DESC`
    } else if (index === 6) {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%' ORDER BY spec_id DESC`
    } else {
        str = `SELECT * FROM suplist WHERE spu_title LIKE '%${input}%'`
    }
    const sql_a = sql.Select_Mysql_Data(str)
    sql_a.then((resultsA) => {
        const stra = 'SELECT * FROM supdetail'
        const sql_b = sql.Select_Mysql_Data(stra)
        sql_b.then((resultsB) => {
            resultsA.forEach(element => {
                if (element.detal_id === null) return
                element.size = []
                resultsB.forEach(item => {
                    if (element.detal_id == item.detal_id) {
                        element.size.push(item)
                    }
                })
            });
            let data = components.pagingtion(page, size, resultsA)
            res.json({
                success: true,
                code: 200,
                data,
                maxData: resultsA.length
            })
        }).catch(() => { })

    }).catch(() => { })
}