// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")
var path = require('path');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./'))

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

//  quagga_js_get_camera
app.get("/quagga_js_get_camera", (req, res, next) => {
    console.log("app.get('/quagga_js_get_camera'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/html/quagga_js_get_camera.html'));
});

//
app.get("/quagga_js_static_images", (req, res, next) => {
    console.log("app.get('/quagga_js_static_images'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/html/quagga_js_static_images.html'));
});

/*
app.get("/css/styles.css", (req, res, next) => {
    console.log("app.get('/css/styles.css'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/css/styles.css'));
});
*/

app.get("/dist/quagga.js", (req, res, next) => {
    console.log("app.get('/dist/quagga.js'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/dist/quagga.js'));
});

app.get("/static_images.js", (req, res, next) => {
    console.log("app.get('/static_images.js'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/static_images.js'));
});

app.get("/vendor/jquery-1.9.0.min.js", (req, res, next) => {
    console.log("app.get('/vendor/jquery-1.9.0.min.js'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/vendor/jquery-1.9.0.min.js'));
});

//  user submits userID
app.get("/getUserInfo", (req, res, next) => {
    console.log("app.get('/form'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/html/getUserInfo.html'));
});

//  form based updateuser
app.get("/adduser", (req, res, next) => {
    console.log("app.get('/adduser'");
    //console.log("__dirname:", __dirname)
    res.sendFile(path.join(__dirname + '/html/adduser.html'));
});


// Insert here other API endpoints
// list all users
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

app.post("/api/getUserInfo/", (req, res, next) => {
    console.log("app.post('/api/getUserInfo/'");
    var id = req.body.id;
    console.log("id:", id)
    res.redirect('/api/user/'+id);
})

// Get a single user by id
app.get("/api/user/:id", (req, res, next) => {
    console.log("/api/user/:id, id='"+req.params.id+"'")
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          console.log("error getting user: ", err.message)
          return;
        }
        console.log("success getting user info, row=\n", row)
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
    console.log("Update a user: app.patch('/api/user/:id' :", req.params.id)
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
    //console.log("res.status(404)\n", res.status(404))
    res.status(404);
});
