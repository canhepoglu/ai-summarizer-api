require('dotenv').config();
const express = require('express');
const multer = require('multer');

const summarizeRoutes = require('./routes/summarizeRoutes');
const summarizeFromUrlRoutes = require('./routes/summarizeFromUrlRoutes');
const summarizeLongVideoRoutes = require('./routes/summarizeLongVideoRoutes');
const summarizeLargeAudioRoutes = require('./routes/summarizeLargeAudioRoutes');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use('/api', summarizeRoutes(upload));
app.use('/api', summarizeFromUrlRoutes);
app.use('/api', summarizeLongVideoRoutes);
app.use('/api', summarizeLargeAudioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
