import mongoose from 'mongoose';

// MongoDB connection string
const mongoURI = "mongodb+srv://soumyadeepsp:hospital@hms.zipnl.mongodb.net/?retryWrites=true&w=majority&appName=hms";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));