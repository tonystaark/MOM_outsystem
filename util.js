'use strict'

module.exports = {
    promiseFn : (dbOperation, values) => {
        return new Promise(function(resolve, reject) {
            db.query(dbOperation, values,  (err, result) => {
                if (err) {
                    reject(err)
                }else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        })    
    },
     diff_years : (dt1, dt2) => {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24);
        const result = Math.abs(Math.round(diff/365.25));  
        // console.log('result', result)
        return result;
    }
}