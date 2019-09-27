const Router = require('koa-router');
const router = new Router()
const { promiseFn, diff_years } = require ('../util.js');

const checkAgeAndPhoneNumber = (ctx, dateOfBirth, mobilePhoneNumber) => {
    ctx.assert(typeof dateOfBirth === 'string', 
        400,
        'Age must be a string'
    )
    ctx.assert(diff_years(new Date(dateOfBirth), new Date()) > 17, 
        400,
        'Age must not be lower than 18'
    )
    if (mobilePhoneNumber != null ) {
        ctx.assert(mobilePhoneNumber.match(/null|(^$)|^[6|8|9][0-9]{7}$/), 
        400, 
        'Phone number must start with either 6, 8 or 9 and consists of 8 digits.')
    }
   
}

const pad = (num, size) => {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

router
    .post('/applications', async (ctx, next) => {
        const { mobilePhoneNumber, comment, status, dateOfBirth } = ctx.request.body
        const createRow = 
        `INSERT INTO applicationTable
        (salutation, fullName, dateOfBirth, gender, status, mobilePhoneNumber, yearOfBirth) 
        VALUES (?)`
        const values = Object.values(ctx.request.body)
        values.push(new Date(dateOfBirth).getFullYear())
        console.log('values',values)
        checkAgeAndPhoneNumber(ctx, dateOfBirth, mobilePhoneNumber )
        ctx.assert(!comment, 
            400, 
            'There should not be a comment field')
        ctx.assert(status === 'underReview', 
            400, 
            'Submission status should be underReview.')
        ctx.body = await promiseFn(createRow, [values])
        ctx.body.message = ctx.request.body;
        ctx.response.status = 201;
    })

    .get('/applications', async(ctx, next) => {
        const getTable = `SELECT * FROM applicationTable` 
        ctx.body = await promiseFn(getTable)
    })

    .get('/applications/:id', async(ctx, next) => {
        const getTable = `SELECT * FROM applicationTable WHERE id = ?`
        const item = await promiseFn(getTable, ctx.params.id)
        ctx.assert(item.length > 0, 
            404, 
            'No such person or id exists')
        ctx.body = item;
    })

    .patch('/applications/:id', async(ctx, next) => {
        const values = Object.values(ctx.request.body)
        const { dateOfBirth } = ctx.request.body
        // checkAgeAndPhoneNumber(ctx, dateOfBirth, mobilePhoneNumber )
        let result;
        if (ctx.query.status === 'approved') {
            const searchTable = `
            SELECT COUNT(*)
            FROM applicationTable
            USE INDEX (yearOfBirth)
            WHERE yearOfBirth = ? AND status = 'approved'
            `
            let lastFour
            const fullYear = new Date(dateOfBirth).getFullYear()
            const item = await promiseFn(searchTable,  fullYear)
            const itemCount = item[0]['COUNT(*)']
            
            lastFour = itemCount === 0 ?  '0001' :  pad(itemCount, 4)
            const membershipNumber = fullYear + lastFour
            values.push(membershipNumber, ctx.params.id)
            const updateWithApproved = 
            `UPDATE applicationtable
            SET status = CASE WHEN status != "approved" THEN ? ELSE status END, 
            membershipNumber = @membershipNumber := CASE WHEN membershipNumber IS NULL THEN ? ELSE membershipNumber END
            WHERE id = ?;
            SELECT @membershipNumber
            `
            result = await promiseFn(updateWithApproved, values)

        } else if (ctx.query.status === 'rejected'){
            const updateWithRejected = 
            `UPDATE applicationtable
            SET status = CASE WHEN status != "approved" THEN ? ELSE status END, 
            comment = CASE WHEN status != "approved" THEN ? ELSE comment END
            WHERE id = ?;`
            values.push(ctx.params.id)
            result = await promiseFn(updateWithRejected, values)
        }
        ctx.body = result;
        ctx.body.message = ctx.request.body;
    })

    .put('/applications/:id', async(ctx, next) => {
            const values = Object.values(ctx.request.body)
            const update = 
            `
                UPDATE applicationtable
                SET salutation = ?, fullName = ?, dateOfBirth = ?, gender = ?,  status = ?,
                mobilePhoneNumber = ?
                WHERE id = ? and status = 'underReview'
            `
            values.push(ctx.params.id)
            const result = await promiseFn(update, values)
            ctx.body = result;
            ctx.body.message = ctx.request.body;
 
    })
module.exports = router; 