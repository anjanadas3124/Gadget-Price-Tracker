const express = require('express');
const app = express();

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.use(express.static('public')); // Serve static files like CSS, JS, images

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
            { name: 'Wireless Earbuds', price: 28, originalPrice: 40, image: 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/23241662/2024/2/1/5a0c17bf-8f52-49e1-a29a-39e9e979be7a1706781353663-NOISE-Buds-Aero-Truly-Wireless-Earbuds-with-45hrs-Playtime-a-14.jpg' },
            { name: 'Smart Speaker', price: 59, originalPrice: 80, image: 'https://5.imimg.com/data5/ZI/QV/LH/SELLER-12479946/amazon-echo-white-500x500.jpg' },
            { name: 'Gaming Headset', price: 99, originalPrice: 120, image: 'https://i.pinimg.com/736x/dd/ec/ae/ddecae1853b219122b1b6083b696ec03.jpg' }
        ]
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
