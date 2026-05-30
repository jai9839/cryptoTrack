const fs = require('fs');
const PDFDocument = require('pdfkit');

const outputPath = __dirname + '/Backend_Process.pdf';
const doc = new PDFDocument({ margin: 50 });

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

doc.fontSize(22).text('CryptoTrack Backend Process', { underline: true });
doc.moveDown();

doc.fontSize(12).text('This document summarizes the backend architecture, implementation details, and interview preparation points for the CryptoTrack project.', {
  align: 'left',
});
doc.moveDown();

function heading(text) {
  doc.fontSize(14).fillColor('#000000').text(text, { underline: false });
  doc.moveDown(0.3);
}

function paragraph(text) {
  doc.fontSize(11).fillColor('#000000').text(text, { align: 'left', lineGap: 3 });
  doc.moveDown(0.2);
}

function list(items) {
  items.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`, { indent: 20, lineGap: 3 });
  });
  doc.moveDown(0.2);
}

heading('1. Project Overview');
paragraph('The backend is a Node.js Express API that supports user authentication, watchlist and portfolio management, and currency exchange rate proxying. MongoDB is used as the database, while Passport.js handles local and JWT-based authentication.');

heading('2. Key Backend Files');
list([
  'Server/server.js - main API server, route definitions, and CORS configuration.',
  'Server/db.js - Mongoose database connection setup and lifecycle logging.',
  'Server/auth.js - Passport local and JWT strategies for login and protected routes.',
  'Server/models/Users.js - User schema, password hashing, watchlist, and portfolio storage.',
]);

heading('3. Environment and Startup');
paragraph('The backend uses dotenv to load environment variables from a .env file. Important variables include:');
list([
  'MONGODB_URI - MongoDB connection string.',
  'JWT_SECRET - secret used to sign JSON Web Tokens.',
  'CLIENT - frontend URL allowed for CORS in production.',
]);
paragraph('Start the backend with: node server.js');

heading('4. CORS and Local Development');
paragraph('CORS is configured with a custom origin checker that allows local frontend origins on ports 5173 and 5174 in addition to the configured CLIENT origin. This enables secure cross-origin requests during development.');

heading('5. Authentication Flow');
paragraph('Authentication uses Passport to separate login and authorization logic:');
list([
  'POST /register - creates a new user and hashes the password with bcrypt.',
  'POST /login - verifies credentials and returns a signed JWT valid for 24 hours.',
  'Protected routes use passport.authenticate("jwt") to validate the Authorization bearer token.',
]);

heading('6. User Model and Data Storage');
paragraph('The User model stores:');
list([
  'username - unique login identifier.',
  'password - stored as a bcrypt hash.',
  'watchlist - array of coin IDs saved by the user.',
  'portfolio - Map of coin IDs to an object with totalInvestment and coins count.',
]);

heading('7. API Endpoints');
list([
  'GET / - health check endpoint returning API status.',
  'GET /currency - proxy endpoint to retrieve USD-based exchange rates from Frankfurter API.',
  'POST /register - user registration with password hashing.',
  'POST /login - user login, JWT issuance, and response with user details.',
  'GET /watchlist - returns the authenticated user watchlist.',
  'GET /portfolio - returns the authenticated user portfolio data.',
  'PUT /watchlist/add - adds a coin to the authenticated user watchlist.',
  'PUT /watchlist/remove - removes a coin from the authenticated user watchlist.',
  'PUT /portfolio/update - updates the authenticated user portfolio for buy/sell operations.',
]);

heading('8. Portfolio Update Logic');
paragraph('This endpoint handles portfolio changes while keeping investment and holding values consistent. It supports both buy and sell operations with validation:');
list([
  'If the coin already exists, update its coin quantity and total investment.',
  'Selling coins subtracts the amount and adjusts the remaining investment proportionally.',
  'If holdings go to zero, the coin is removed from the portfolio map.',
  'Input validation requires totalInvestment and coins values to be numeric.',
]);

heading('9. Interview Preparation Questions');
list([
  'How does the backend authenticate users and protect routes?',
  'Why is JWT chosen over session-based authentication?',
  'How is password hashing implemented in the User model?',
  'What is the purpose of the /currency proxy endpoint?',
  'Why did you configure custom CORS origin checking?',
  'How does the portfolio update endpoint handle buy and sell transactions?',
  'Why use a Map for the portfolio field in MongoDB?',
  'How does dotenv improve configuration management?',
]);

doc.end();

writeStream.on('finish', () => {
  console.log('PDF generated at:', outputPath);
});
