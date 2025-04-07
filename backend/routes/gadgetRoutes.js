const express = require('express');
const router = express.Router();

// Dummy data for now (you can replace with DB data later)
const deals = [
    {
        id: '1',
        name: 'Samsung S23',
        discount: '30% OFF',
        originalPrice: 999,
        dealPrice: 699,
        image: 'https://i.pinimg.com/736x/78/d7/4b/78d74b9568c5bb06040a7952b1a6b2a5.jpg',
        expiry: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Airpodes Pro',
        discount: '50% OFF',
        originalPrice: 199,
        dealPrice: 99,
        image: 'https://i.pinimg.com/736x/81/a2/07/81a20722a03d3cfb24c11b9d9470e62d.jpg',
        expiry: new Date().toISOString()
    },
    {
        id: '3',
        name: 'JBL Speaker',
        discount: '25% OFF',
        originalPrice: 140,
        dealPrice: 35,
        image: 'https://i.pinimg.com/736x/c9/dd/a3/c9dda3805029289d7527a7bbb504faf7.jpg',
        expiry: new Date().toISOString()
    }
    // Add more deals as needed
];

// Route to render deals page
router.get('/deals', (req, res) => {
    res.render('deals', { deals });
});

module.exports = router;
