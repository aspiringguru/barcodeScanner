var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "demo_db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.log("Cannot open database")
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        console.log('creating table user.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            email text UNIQUE,
            password text,
            CONSTRAINT email_unique UNIQUE (email)
            )`,
        (err) => {
            if (err) {
                console.log("Table user already created.")
            }else{
                // Table just created, creating some rows
                console.log("Table user just created, creating some rows")
                var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                db.run(insert, ["admin","admin@example.com",md5("admin123456")])
                db.run(insert, ["user","user@example.com",md5("user123456")])
            }
        });
        //create table for barcodes.
        console.log('creating table barcodes.')
        db.run(`CREATE TABLE barcodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode text
            )`,
        (err) => {
            if (err) {
                console.log("Table barcode already created.")
            }else{
                console.log("Table barcode just created.")
            }
        });

    }
});


module.exports = db
