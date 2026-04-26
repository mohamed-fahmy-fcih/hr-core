const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const userRoutes = require('./routes/users');
const masterSkillRoutes = require('./routes/masterSkills');
const departmentRoutes = require('./routes/departments');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/users', userRoutes);
app.use('/api/master-skills', masterSkillRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/', (req, res) => {
  res.send('HR-Core API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
