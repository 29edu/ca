require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use("/api/farmers", require("./routes/farmers"));
app.use("/api/lands", require("./routes/lands"));
app.use("/api/schemes", require("./routes/schemes"));
app.use("/api/enrollments", require("./routes/enrollments"));
app.use('/api/dashboard', require('./routes/dashboard')); // <--- ADD THIS

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
