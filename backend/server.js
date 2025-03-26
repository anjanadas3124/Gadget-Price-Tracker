const express = require('express');
const connectDB = require('./config/db'); 
const path = require('path');

const app = express();
connectDB(); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    
    
    res.send('Login successful (Placeholder response)');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
