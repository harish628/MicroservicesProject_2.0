const target = process.env.API_URL;

if (!target) {
  throw new Error('API_URL must be set before starting the Angular development server.');
}

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
  '/health': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
