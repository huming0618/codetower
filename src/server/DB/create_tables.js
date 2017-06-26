let pgClient = require('pg').Client;
const client = new pgClient('postgres://tower:tower@localhost/tower');

client.connect((err)=>{
    if (err){}
    else {
        console.log('connected');
        const create_sql = `
            CREATE TABLE note (
                id              SERIAL PRIMARY KEY,
                project         varchar(100) NOT NULL,
                file            varchar(1000) NOT NULL,
                title           varchar(100) NOT NULL,
                type            varchar(10)
            );

            CREATE TABLE note_detail (
                note_id         integer NOT NULL,
                body            varchar(200) NOT NULL
            );
        `
        const query = client.query(create_sql, function(err, result) {
            if (err){
                console.error(err);
                return;
            }
            console.log('result', result);
            //console.log(result.rows[0].name);
        });
    }
});

