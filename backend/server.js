const express = require('express');
const gadgetRoutes = require('./routes/gadgetRoutes');
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

// Cart Schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        quantity: { type: Number, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model('Cart', cartSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/', gadgetRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

// Route to get cart count for navigation
app.get('/api/cart/count', async (req, res) => {
    if (!req.session.user) {
        return res.json({ count: 0 });
    }
    
    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        res.json({ count });
    } catch (error) {
        console.error('Cart count error:', error);
        res.json({ count: 0 });
    }
});

// Routes
app.get('/', async (req, res) => {
    let cartCount = 0;
    
    if (req.session.user) {
        try {
            const cart = await Cart.findOne({ userId: req.session.user.id });
            cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    }

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
            { 
                id: '1',
                name: 'Wireless Earbuds', 
                price: 28, 
                originalPrice: 40, 
                image: 'https://i.pinimg.com/736x/9d/1f/06/9d1f06606fa55988738ee5f4569a6481.jpg' 
            },
            { 
                id: '2',
                name: 'Smart Speaker', 
                price: 59, 
                originalPrice: 80, 
                image: 'https://i.pinimg.com/736x/7c/bc/fa/7cbcfa9c4131300069e502776b3827a6.jpg' 
            },
            { 
                id: '3',
                name: 'Mobiles', 
                price: 99, 
                originalPrice: 120, 
                image: 'https://www.rajanandco.in/pub/media/catalog/product/cache/bec761d54e398ba11dc5e3b7a5b5a37a/v/i/vivo_m11.jpg' 
            },
            { 
                id: '4',
                name: 'Laptops', 
                price: 99, 
                originalPrice: 120, 
                image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202408/asus-zenbook-s16-275442374-16x9_0.jpg?VersionId=iIiE1tP4hXggJACnpWjUf1GqZNZz2xe8&size=690:388' 
            }
        ],
        user: req.session.user,
        cartCount
    });
});

app.get('/products', (req, res) => {
    const products = [
        { id: '5', name: "Wireless Earbuds", price: 28, image: "/images/earbuds1.jpg" },
        { id: '6', name: "Noise Cancelling Earbuds", price: 40, image: "/images/earbuds2.jpg" },
        { id: '7', name: "Gaming Earbuds", price: 55, image: "/images/earbuds3.jpg" },
        { id: '8', name: "Sports Earbuds", price: 35, image: "/images/earbuds4.jpg" }
    ];
    res.render('products', { title: "Products", products, user: req.session.user });
});

// Cart Routes
app.get('/cart', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        
        // Calculate total
        let total = 0;
        if (cart) {
            total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        res.render('cart', {
            title: 'Your Cart',
            cart: cart || { items: [] },
            total: total.toFixed(2),
            user: req.session.user
        });
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).render('error', { message: 'Error loading cart' });
    }
});

app.post('/add-to-cart', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { productId, name, price, image } = req.body;
    
    try {
        let cart = await Cart.findOne({ userId: req.session.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.session.user.id,
                items: [{ productId, name, price, image, quantity: 1 }]
            });
        } else {
            const existingItem = cart.items.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push({ productId, name, price, image, quantity: 1 });
            }
        }

        await cart.save();
        res.json({ 
            success: true, 
            cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0) 
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Error adding to cart' });
    }
});

// POST route for contact form
app.post('/contact', (req, res) => {
    // Process the form data (you would add your email sending or database logic here)
    console.log('Form submitted:', req.body);
    
    // Redirect with success parameter
    res.redirect('/contact?success=true');
});

// GET route for contact page
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        user: req.session.user,
        success: req.query.success // Pass the success parameter to the view
    });
}); 
// Import route
const contactRoutes = require('./routes/contactRoutes');
app.use('/', contactRoutes); // mount contact routes

// Add this with your other routes

app.get('/deals', async (req, res) => {
    try {
        // Sample deal data - in a real app you'd fetch from your database
        const deals = [
            {
                id: 'deal1',
                name: 'Wireless Earbuds Pro',
                originalPrice: 99.99,
                dealPrice: 59.99,
                discount: '40% OFF',
                image: 'https://i.pinimg.com/736x/9d/1f/06/9d1f06606fa55988738ee5f4569a6481.jpg',
                expiry: '2025-12-31'
            },
            {
                id: 'deal2',
                name: 'Smart Speaker X200',
                originalPrice: 129.99,
                dealPrice: 79.99,
                discount: '38% OFF',
                image: 'https://i.pinimg.com/736x/7c/bc/fa/7cbcfa9c4131300069e502776b3827a6.jpg',
                expiry: '2025-11-30'
            },
            {
                id: 'deal3',
                name: 'Gaming Keyboard RGB',
                originalPrice: 89.99,
                dealPrice: 49.99,
                discount: '44% OFF',
                image: 'https://m.media-amazon.com/images/I/71H38V7K0FL._AC_UF1000,1000_QL80_.jpg',
                expiry: '2025-10-15'
            },
            {
                id: 'deal4',
                name: '4K Action Camera',
                originalPrice: 199.99,
                dealPrice: 149.99,
                discount: '25% OFF',
                image: 'https://www.insta360.com/cdn/shop/files/onex3_01_900x.jpg',
                expiry: '2025-09-30'
            }
        ];

        let cartCount = 0;
        if (req.session.user) {
            const cart = await Cart.findOne({ userId: req.session.user.id });
            cartCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        }

        res.render('deals', {
            title: 'Hot Deals',
            deals,
            user: req.session.user,
            cartCount
        });
    } catch (error) {
        console.error('Deals page error:', error);
        res.status(500).render('error', { message: 'Error loading deals' });
    }
});

app.post('/update-cart-item', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { productId, quantity } = req.body;
    
    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        if (!cart) return res.status(404).json({ success: false });

        const item = cart.items.find(item => item.productId === productId);
        if (!item) return res.status(404).json({ success: false });

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.productId !== productId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.json({ 
            success: true,
            cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false });
    }
});

app.post('/remove-from-cart', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { productId } = req.body;
    
    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        if (!cart) return res.status(404).json({ success: false });

        cart.items = cart.items.filter(item => item.productId !== productId);
        await cart.save();
        
        res.json({ 
            success: true,
            cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false });
    }
});

// Signup Routes
app.get('/signup', (req, res) => {
    res.render('signup', { signupError: null, user: req.session.user });
});

app.post('/signup', async (req, res) => {
    const { newEmail: email, newPassword: password } = req.body;

    if (!email || !password) {
        return res.render('signup', { signupError: 'Email and password are required.', user: req.session.user });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { signupError: 'Email already taken.', user: req.session.user });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).render('signup', { 
            signupError: 'Error creating account. Please try again.',
            user: req.session.user
        });
    }
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null, user: req.session.user });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { errorMessage: 'Email and password are required.', user: req.session.user });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { errorMessage: 'Invalid email or password.', user: req.session.user });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('login', { errorMessage: 'Invalid email or password.', user: req.session.user });
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
            errorMessage: 'Error during login. Please try again.',
            user: req.session.user
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
    res.status(404).render('404', { title: 'Page Not Found', user: req.session.user });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Server Error', user: req.session.user });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});