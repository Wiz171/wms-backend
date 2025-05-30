const axios = require('axios');

const BASE_URL = (process.env.APP_URL || `http://localhost:${process.env.PORT || 8080}`).replace(/\/$/, '');

exports.homeRoutes = (req, res) => {
    // Remove all rendering and sending for backend API-only deployment
    res.status(404).json({ message: 'Not found' });
};

exports.add_user = (req, res) => {
    res.status(404).json({ message: 'Not found' });
};

exports.update_user = (req, res) => {
    res.status(404).json({ message: 'Not found' });
};