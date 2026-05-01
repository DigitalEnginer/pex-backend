const Stock = require('../models/Stock');
const User = require('../models/User');
const wsService = require('../services/wsService');

exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createStock = async (req, res) => {
  try {
    const { ticker } = req.body;
    const userId = req.user.id;

    const existingStock = await Stock.findOne({ creator: userId });
    if (existingStock) {
      return res.status(400).json({ message: 'User already has a stock' });
    }

    const tickerExists = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (tickerExists) {
      return res.status(400).json({ message: 'Ticker already exists' });
    }

    const newStock = new Stock({
      ticker: ticker.toUpperCase(),
      creator: userId,
      price: 100 
    });

    await newStock.save();

    wsService.broadcast({
      type: "NEW_TICKER",
      payload: newStock
    });

    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { price } = req.body;
    const stockId = req.params.id;
    const userId = req.user.id;

    const stock = await Stock.findById(stockId);
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    if (stock.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    stock.price = Number(price);
    await stock.save();

    wsService.broadcast({
      type: "TICKER_UPDATE",
      payload: {
        ticker: stock.ticker,
        price: stock.price
      }
    });

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.buyStock = async (req, res) => {
  try {
    const { ticker, shares } = req.body;
    const userId = req.user.id;
    const quantity = Number(shares);

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const totalCost = stock.price * quantity;
    const user = await User.findById(userId);

    if (user.walletBalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.walletBalance -= totalCost;
    const holdingIndex = user.holdings.findIndex(h => h.ticker === stock.ticker);
    
    if (holdingIndex > -1) {
      user.holdings[holdingIndex].shares += quantity;
    } else {
      user.holdings.push({ ticker: stock.ticker, shares: quantity });
    }

    await user.save();

    res.json({ 
      message: 'Purchase successful', 
      walletBalance: user.walletBalance, 
      holdings: user.holdings 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};