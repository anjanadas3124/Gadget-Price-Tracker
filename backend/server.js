const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.set('view engine', 'ejs'); 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure Session Middleware
app.use(
    session({
        secret: 'your_secret_key', // Change this to a secure key
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set `true` if using HTTPS
    })
);

// Temporary user storage (Replace with a database in production)
const users = [];

// Home Route
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Gadget Price Tracker',
        heroTitle: 'Your Trusted Gadgets Device Partner',
        heroSubtitle: 'Find the best deals on top gadgets.',
        heroImage: 'https://cdn.dribbble.com/userupload/20190595/file/original-e4ef110c930aa3ed1b854934558a8fd4.gif',
        categories: [
            { name: 'Mobile', emoji: '📱' },
            { name: 'Audio', emoji: '🎧' },
            { name: 'Computer', emoji: '🖥️' },
            { name: 'Gaming', emoji: '🕹️' },
            { name: 'Camera', emoji: '📷' }
        ],
        products: [
            { name: 'Wireless Earbuds', price: 28, originalPrice: 40, image: 'https://i.pinimg.com/736x/9d/1f/06/9d1f06606fa55988738ee5f4569a6481.jpg' },
            { name: 'Smart Speaker', price: 59, originalPrice: 80, image: 'https://i.pinimg.com/736x/7c/bc/fa/7cbcfa9c4131300069e502776b3827a6.jpg' },
            { name: 'Gaming Headset', price: 99, originalPrice: 120, image: 'https://i.pinimg.com/736x/75/71/36/75713637d583deb96c7518087a34475a.jpg' }
        ],
        user: req.session.user // Pass user session to the frontend
    });
});

// Signup Routes
app.get('/signup', (req, res) => {
    res.render('signup', { signupError: null });
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('signup', { signupError: 'Email and password are required.' });
    }

    if (users.some(user => user.email === email)) {
        return res.render('signup', { signupError: 'Email already taken.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        users.push({ email, password: hashedPassword }); // Store hashed password
        res.redirect('/login'); // Redirect to login
    } catch (error) {
        res.status(500).send('Error signing up. Try again.');
    }
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { errorMessage: 'Email and password are required.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.render('login', { errorMessage: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.render('login', { errorMessage: 'Invalid email or password.' });
    }

    req.session.user = user; // Store user in session
    res.redirect('/'); // Redirect to homepage
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login'); // Redirect to login after logout
    });
});

// 404 Error Handling
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
