let pgClient = require('pg').Client;
const client = new pgClient('postgres://tower:tower@localhost/tower');

client.connect((err)=>{
    if (err){}
    else {
        console.log('connected');
        const query = client.query("SELECT test FROM table_test", function(err, result) {
            console.log('result', result);
            //console.log(result.rows[0].name);
        });
    }
});

