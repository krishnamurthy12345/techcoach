
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('./Middleware/passportConfig');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const groupRoutes = require('./routes/group.routes');

require('dotenv').config();

const app = express();
const PORT = 6005;

app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(morgan('tiny'));
app.use(session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/api', decisionRoutes);
app.use('/group', groupRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

