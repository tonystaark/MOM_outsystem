import request from 'supertest';
import app from './app';
import { diff_years } from './util.js';

const application = {
    "salutation" : "Mr",
    "fullName": "Name 1",
    "dateOfBirth": "1990-06-10",
    "gender": "Female",
    "status": "underReview",
    "mobilePhoneNumber": null,
}

const updatedApplication = {
    "salutation" : "Ms",
    "fullName": "Name 6",
    "dateOfBirth": "1990-06-10",
    "gender": "Female",
    "status": "underReview",
    "mobilePhoneNumber": "98888888",
}

const applicationApproved = {
    "status": "approved",
}

const applicationRejected = {
    "status": "rejected",
    "comment": "sdsd"
}


const checkAgeAndPhoneNumber = (application) => {
    test('given age is in string format', () => {
        expect (typeof application.dateOfBirth).toBe('string')
    })
    test('given age is in proper format', () => {
        expect ((/^\d{4}\-\d{2}\-\d{2}$/).test(application.dateOfBirth)).toBe(true);
    })
    test('accept only 18 year old and above', () => {
        const diffYear = diff_years(new Date(application.dateOfBirth), new Date());
        expect (diffYear).toBeGreaterThan(17)
    })
    test('phone number must start with either 6, 8 or 9 and consists of 8 digits', () => {
        expect((/null|(^$)|^[6|8|9][0-9]{7}$/).test(application.mobilePhoneNumber)).toBe(true);
    })
}

describe('post submission:', () => {
    
    test('must not have a comment', () => {
        expect(application).not.toHaveProperty('comment');
    })
    test('status must be underReview', () => {
        expect(application.status).toBe('underReview');
    })
    checkAgeAndPhoneNumber(application);
    test('returns 201 response status', async done => {   
        const response = await request(app.callback()).post('/applications').send(application)
        expect(response.status).toBe(201);
        done()
    });
})

describe('get submissions:', () => {
    test('successfully retrieve all', async done => {
        const response = await request(app.callback()).get('/applications')
        expect(response.status).toBe(200);
        done()
    })
    test('successfully retrieve a particular person info in the database', async done => {
        const response = await request(app.callback()).get('/applications/1')
        expect(response.status).toBe(200);
        done()
    })
    test('returns error if the person is not in the database', async done => {
        const response = await request(app.callback()).get('/applications/999')
        expect(response.status).toBe(404);
        done()
    })
})

describe('approve submission:', () => {
    test('status must be approved', () => {
        expect(applicationApproved.status).toBe('approved');
    })
    test('must not have comment field', () => {
        expect(applicationApproved).not.toHaveProperty('comment');
    })
    test('for new YOB, membership numbers is in the format of YYYY0001', async done => {
        const response = await request(app.callback()).put('/applications/1?status=approved').send(applicationApproved)
        console.log('response',response.body)
        expect(response.body[1][0]['@membershipNumber']).toBe(new Date(applicationApproved.dateOfBirth).getFullYear() + '0001');
        expect(response.status).toBe(200);
        done();
    })
    test('for the same YOB, membership numbers is in the format of YYYY0002', async done => {
        const response = await request(app.callback()).put('/applications/2?status=approved').send(applicationApproved)
        expect(response.body[1][0]['@membershipNumber']).toBe(new Date(applicationApproved.dateOfBirth).getFullYear() + '0002');
        expect(response.status).toBe(200);
        done();
    })
})

describe('reject submission:', () => {
    test('status must be rejected', () => {
        expect(applicationRejected.status).toBe('rejected');
    })
    test('must have comment field', () => {
        expect(applicationRejected).toHaveProperty('comment');
    })
    test('comment must not be null', () => {
        expect(applicationRejected.comment).toStrictEqual(expect.anything());
    })
    test('comment must not be an empty string', () => {
        expect(applicationRejected.comment).not.toBe("");
    })
    test('reject successfully returns 201', async done => {
        const response = await request(app.callback()).patch('/applications/4?status=rejected').send(applicationRejected)
        expect(response.status).toBe(200);
        done()
    })
    test('unable to reject the approved submission', async done => {
        const response = await request(app.callback()).patch('/applications/2?status=rejected').send(applicationRejected)
        expect(response.status).toBe(200);
        done()
    })
})

describe('update submission:', () => {
    
    test('must not have a comment', () => {
        expect(updatedApplication).not.toHaveProperty('comment');
    })
    test('status must be underReview', () => {
        expect(updatedApplication.status).toBe('underReview');
    })
    checkAgeAndPhoneNumber(updatedApplication);
    test('returns 201 response status', async done => {   
        const response = await request(app.callback()).put('/applications/5').send(updatedApplication)
        expect(response.status).toBe(200);
        done()
    });
})