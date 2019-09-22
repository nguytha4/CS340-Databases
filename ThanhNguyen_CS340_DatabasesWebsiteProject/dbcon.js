var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            :
  password        : 
  database        : 'cs340_byrnemat'
});

module.exports.pool = pool;
