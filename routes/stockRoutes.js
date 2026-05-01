const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const auth = require('../middleware/auth');

router.get('/', stockController.getAllStocks);
router.post('/', auth, stockController.createStock);
router.put('/:id/price', auth, stockController.updatePrice);
router.post('/buy', auth, stockController.buyStock);

module.exports = router;