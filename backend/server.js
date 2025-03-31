const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gadgetTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

// Routes
app.get('/', async (req, res) => {
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
            { name: 'Mobiles', price: 99, originalPrice: 120, image: 'https://www.rajanandco.in/pub/media/catalog/product/cache/bec761d54e398ba11dc5e3b7a5b5a37a/v/i/vivo_m11.jpg' },
            { name: 'Laptops', price: 99, originalPrice: 120, image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202408/asus-zenbook-s16-275442374-16x9_0.jpg?VersionId=iIiE1tP4hXggJACnpWjUf1GqZNZz2xe8&size=690:388' }

        ],
        user: req.session.user
    });
});

app.get('/products', (req, res) => {
    const products = [
        { name: "Wireless Earbuds", price: 28, image: "/images/earbuds1.jpg" },
        { name: "Noise Cancelling Earbuds", price: 40, image: "/images/earbuds2.jpg" },
        { name: "Gaming Earbuds", price: 55, image: "/images/earbuds3.jpg" },
        { name: "Sports Earbuds", price: 35, image: "/images/earbuds4.jpg" }
    ];
    res.render('products', { title: "Products", products });
});

// Signup Routes
app.get('/signup', (req, res) => {
    res.render('signup', { signupError: null });
});

app.post('/signup', async (req, res) => {
    const { newEmail: email, newPassword: password } = req.body;

    if (!email || !password) {
        return res.render('signup', { signupError: 'Email and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { signupError: 'Email already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).render('signup', { 
            signupError: 'Error creating account. Please try again.' 
        });
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

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { errorMessage: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('login', { errorMessage: 'Invalid email or password.' });
        }

        req.session.user = { 
            id: user._id,
            email: user.email,
            createdAt: user.createdAt
        };
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', { 
            errorMessage: 'Error during login. Please try again.' 
        });
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

// Error Handlers
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Server Error' });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});