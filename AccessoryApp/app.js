const express = require("express");
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

//Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage : storage});

// Create MySQL connection
const connection = mysql.createConnection({
//host: 'localhost',
//user: 'root',
//password: 'Republic_C207',
//database: 'ga_accessory'
host: 'db4free.net',
user: 'username_created_for_db4free.net',
password: 'password_created_for_db4free.net',
database: 'databaseName_created_for_db4free.net'
});

connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded ({
    extended: false
}));

const port = 3000;

//let accessories = [
    //{ id: 1, name: 'Bracelets', quantity: 100 },
    //{ id: 2, name: 'Necklaces', quantity: 50 },
    //{ id: 3, name: 'Earrings', quantity: 150 }
  //];

//Retrieve and Display all accessories
app.get('/inventory', (req, res) => {
    const sql = 'SELECT * FROM accessory';
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving accessory');
        }
        res.render('index', { accessory: results });
    })
});

//Route to get a specific accessories by name
app.get('/editaccessories/:id', (req, res) => {
    const idaccessory = req.params.id;
    const sql = 'SELECT * FROM accessory WHERE idaccessory = ?';

    connection.query( sql, [idaccessory], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving accessory by ID');
        }
        if (results.length > 0) {
            res.render('editaccessories', { accessory:results[0] });
        }
        else {
            res.status(404).send('Accessory not found');
        }
    });
});

//add a new accessory form
app.get('/addaccessories', (req, res) => {
    res.render('addaccessories')
});

//add a new accessory
app.post('/addaccessories', upload.single('image'), (req, res) => {
    const { name, quantity, price } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = null;
    }

    const sql = 'INSERT INTO accessory (name, quantity, price, image) VALUES (?, ?, ?, ?)';
    
    connection.query( sql , [name, quantity, price, image], (error, results) => {
        if (error) {
            console.error("Error adding accessory:", error);
            res.status(500).send('Error adding accessory');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/editaccessories/:id/', upload.single('image'), (req, res) => {
    const idaccessory = req.params.id;
    const { name, quantity, price } = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE accessory SET name = ?, quantity = ?, price = ?, image =? WHERE idaccessory = ?';
    connection.query( sql , [name, quantity, price, image, idaccessory], (error, results) => {
        if (error) {
            console.error("Error updating accessory:", error);
            res.status(500).send('Error updating accessory');
        } else {
            res.redirect('/');
        }
    });
});

//delete an accessory by ID
app.get('/deleteaccessories/:id', (req, res) => {
    const idaccessory = req.params.id;
    const sql = 'DELETE FROM accessory WHERE idaccessory = ?';
    connection.query( sql, [idaccessory], (error, results) => {
        if (error) {
            console.error("Error deleting accessory:", error);
            res.status(500).send('Error deleting accessory');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/', upload.single('image'), (req, res) => {
    const { name } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'SELECT * FROM home'
    connection.query( sql, [name, image], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving accessory');
        }
        res.render('home', { home: results });
    });
});

app.get('/display', upload.single('image'), (req, res) => {
    const { name, info } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'SELECT * FROM display'
    connection.query( sql, [name, info, image], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving accessory');
        }
        res.render('display', { display: results });
    });
});

app.get('/checkout', (req, res) => {
    res.render('checkout')
})

app.listen(port, () => {
    // Log a message when the server is successfully started
    console.log(`Server is running at http://localhost:${port}`);
});
