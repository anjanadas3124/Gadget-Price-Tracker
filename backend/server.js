const express = require('express');
const app = express();

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.use(express.static('public')); // Serve static files like CSS, JS, images
app.use(express.urlencoded({ extended: true })); // Middleware to parse request body

// Temporary user storage (Replace with database in production)
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
        ]
    });
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('login', { errorMessage: 'Email and password are required.' });
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        return res.redirect('/'); // Redirect to homepage after successful login
    } else {
        return res.render('login', { errorMessage: 'Invalid username or password.' });
    }
});

// Signup Routes
app.get('/signup', (req, res) => {
    res.render('signup', { signupError: null }); // Ensure signupError is always defined
});

app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('signup', { signupError: 'Email and password are required.' });
    }

    if (users.some(user => user.email === email)) {
        return res.render('signup', { signupError: 'Email already taken.' });
    }

    users.push({ email, password }); // Add user to temporary array
    res.redirect('/login'); // Redirect to login after successful signup
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

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
