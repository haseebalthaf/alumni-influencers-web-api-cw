require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { scheduleWinnerSelection } = require('./services/winnerScheduler');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  scheduleWinnerSelection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/index.html`);
  });
};

startServer();