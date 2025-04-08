const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
console.log("🚀 App server file running...");


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gadget', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

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

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Helper to get cart count
const getCartCount = async (userId) => {
    if (!userId) return 0;
    try {
        const cart = await Cart.findOne({ userId });
        return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    } catch (error) {
        console.error('Cart count error:', error);
        return 0;
    }
};

// ================= ROUTES ================= //

// Home Route
app.get('/', async (req, res) => {
    const cartCount = await getCartCount(req.session.user?.id);
    
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

// Products Route
app.get('/products', (req, res) => {
    const products = [
        { id: '5', name: "Wireless Earbuds", price: 28, image: "/images/earbuds1.jpg" },
        { id: '6', name: "Noise Cancelling Earbuds", price: 40, image: "/images/earbuds2.jpg" },
        { id: '7', name: "Gaming Earbuds", price: 55, image: "/images/earbuds3.jpg" },
        { id: '8', name: "Sports Earbuds", price: 35, image: "/images/earbuds4.jpg" }
    ];
    res.render('products', { 
        title: "Products", 
        products, 
        user: req.session.user 
    });
});

// Deals Route
app.get('/deals', async (req, res) => {
    try {
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
                image: 'https://m.media-amazon.com/images/I/41Qz+4mkoHL._SR290,290_.jpg',
                expiry: '2025-10-15'
            }
        ];

        const cartCount = await getCartCount(req.session.user?.id);

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

// Cart Count API Route
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

// Cart Routes
app.get('/cart', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        const total = cart ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

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

    try {
        const { productId, name, price, image } = req.body;
        let cart = await Cart.findOne({ userId: req.session.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.session.user.id,
                items: [{ productId, name, price, image, quantity: 1 }]
            });
        } else {
            const existingItem = cart.items.find(item => item.productId === productId);
            existingItem ? existingItem.quantity++ : cart.items.push({ productId, name, price, image, quantity: 1 });
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
app.post('/update-cart-item', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { productId, quantity } = req.body;

    if (!productId || quantity == null || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Invalid request data' });
    }

    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const item = cart.items.find(item => item.productId === productId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

        item.quantity = quantity;
        await cart.save();

        const updatedTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({ 
            success: true, 
            message: 'Cart item updated successfully', 
            updatedItem: item,
            total: updatedTotal.toFixed(2)
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ success: false, message: 'Server error updating cart item' });
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

// ======================
// CONTACT ROUTES (COMPLETE)
// ======================

// GET Contact Page (show form + messages list)
app.get('/contact', async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        const cartCount = await getCartCount(req.session.user?.id);

        res.render('contact', {
            title: 'Contact Us',
            user: req.session.user,
            messages: messages || [],
            success: req.query.success,
            error: req.query.error,
            cartCount
        });
    } catch (err) {
        console.error('Error loading contact page:', err);
        res.render('contact', {
            messages: [],
            error: 'Failed to load messages'
        });
    }
});

// POST New Message (form submission)
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.redirect('/contact?error=All+fields+are+required');
        }
        
        await ContactMessage.create({ name, email, message });
        res.redirect('/contact?success=Message+sent+successfully');
    } catch (err) {
        console.error('Error saving message:', err);
        res.redirect('/contact?error=Failed+to+send+message');
    }
});

// GET Edit Form (pre-filled with message data)
app.get('/contact/edit/:id', async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        const cartCount = await getCartCount(req.session.user?.id);

        if (!message) {
            return res.redirect('/contact?error=Message+not+found');
        }

        res.render('contact', {
            title: 'Edit Message',
            user: req.session.user,
            message, // Pass single message to edit
            messages, // Pass all messages for list
            cartCount,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Error loading edit page:', err);
        res.redirect('/contact?error=Error+loading+message');
    }
});

// POST Update Message (edit form submission)
app.post('/contact/update/:id', async (req, res) => {
    try {
        const { name, email, message, _id } = req.body;
        
        if (!name || !email || !message) {
            return res.redirect(`/contact/edit/${_id}?error=All+fields+are+required`);
        }

        await ContactMessage.findByIdAndUpdate(_id, {
            name,
            email,
            message,
            updatedAt: Date.now()
        });

        res.redirect('/contact?success=Message+updated+successfully');
    } catch (err) {
        console.error('Error updating message:', err);
        res.redirect(`/contact/edit/${req.params.id}?error=Failed+to+update+message`);
    }
});

// POST Delete Message
app.post('/contact/delete/:id', async (req, res) => {
    try {
        await ContactMessage.findByIdAndDelete(req.params.id);
        res.redirect('/contact?success=Message+deleted+successfully');
    } catch (err) {
        console.error('Error deleting message:', err);
        res.redirect('/contact?error=Failed+to+delete+message');
    }
});

// Auth Routes
app.get('/signup', (req, res) => {
    res.render('signup', { 
        signupError: null, 
        user: req.session.user 
    });
});

app.post('/signup', async (req, res) => {
    const { newEmail: email, newPassword: password } = req.body;

    if (!email || !password) {
        return res.render('signup', { 
            signupError: 'Email and password are required.', 
            user: req.session.user 
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { 
                signupError: 'Email already taken.', 
                user: req.session.user 
            });
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

app.get('/login', (req, res) => {
    res.render('login', { 
        errorMessage: null, 
        user: req.session.user 
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { 
            errorMessage: 'Email and password are required.', 
            user: req.session.user 
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { 
                errorMessage: 'Invalid email or password.', 
                user: req.session.user 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('login', { 
                errorMessage: 'Invalid email or password.', 
                user: req.session.user 
            });
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

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});
app.get('/test', (req, res) => {
    res.send("Test route working");
});

// Error Handlers
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page Not Found', 
        user: req.session.user 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { 
        title: 'Server Error', 
        user: req.session.user 
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});