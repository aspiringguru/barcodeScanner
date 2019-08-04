// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 80
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    console.log("app.get('/'")
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
app.get("/api/users", (req, res, next) => {
    console.log("app.get('/api/users'")
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          console.log('error getting data:', err.message);
          return;
        }
        console.log('success retrieving data, rows:', rows);
        console.log('number of users:', rows.length);
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Get a single user by id
app.get("/api/user/:id", (req, res, next) => {
    console.log("/api/user/:id, id=", req.params.id)
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          console.log("error getting user: ", err.message)
          return;
        }
        console.log("success getting user info, row=", row)
        res.json({
            "message":"success",
            "data":row
        })
      });
});


//  Create a new user
app.post("/api/user/", (req, res, next) => {
    console.log("app.post('/api/user/'")
    var errors=[]
    if (!req.body.password){
        console.log("req.body.password=null")
        errors.push("No password specified");
    }
    if (!req.body.email){
        console.log("req.body.email=null")
        errors.push("No email specified");
    }
    if (errors.length){
        console.log("errors.length=", errors.length)
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    console.log("data:", data)
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            console.log("error creating new user: ", err.message)
            return;
        }
        console.log("user created.")
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



// Update a user
//coalesce function = https://www.sqlite.org/lang_corefunc.html#coalesce
app.patch("/api/user/:id", (req, res, next) => {
    console.log("Update a user: app.patch('/api/user/:id' ")
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : null
    }
    console.log("data:", data)
    console.log("updating database.")
    db.run(
        `UPDATE user set
           name = COALESCE(?,name),
           email = COALESCE(?,email),
           password = COALESCE(?,password)
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                console.log("error:", res.message)
                return;
            }
            console.log("update success.")
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

// Default response for any other request
app.use(function(req, res){
    console.log("app.use(function(req, res)  Default response for any other request")
    res.status(404);
});
