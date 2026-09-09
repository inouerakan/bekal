require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const opportunityRoutes = require('./src/routes/opportunityRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/opportunities', opportunityRoutes);

app.get('/', (req, res) => res.json({ message: 'Bekal Opat API is running' }));

// 404 untuk route yang tidak ada
app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
