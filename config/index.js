'use strict'

const mysql = require('mysql')
const env = process.env.NODE_ENV
const config = require(`./${env}`)
const dbName = `${env}`
const createTable =
` 
  CREATE DATABASE IF NOT EXISTS ${dbName};
  USE ${dbName};
  CREATE TABLE IF NOT EXISTS applicationTable(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    salutation ENUM('Mr','Mrs','Mdm','Ms'),
    fullName varchar(80) NOT NULL,
    dateOfBirth DATE NOT NULL,
    gender ENUM('Male','Female'),
    mobilePhoneNumber char(8),
    comment varchar(1000),
    status ENUM('underReview','approved','rejected') NOT NULL,
    membershipNumber char(8),
    yearOfBirth INT(4),
    INDEX (yearOfBirth)
  );
`

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true,
  
})

db.connect(function (err) {
  if (err) throw err;
//   console.log(`Created ${dbName} database !`);
})

db.query(createTable, function (err, result) {
  if (err) throw err;
//   console.log(`Created ${dbName} table !`);
})

global.db = db
module.exports = config