import express from 'express';
import mongoose from 'mongoose';
import { clientRouter } from './api/client/client-router';
import { trainerRouter } from './api/trainer/trainer-router';
import { adminRouter } from './api/admin/admin-router';
import { availabilityRouter } from './api/trainerAvailability/availability-router';

mongoose.connect('mongodb://127.0.0.1:27017/fitness-app', {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const app = express();
const port = process.env.port || 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the app for booking training sessions with personal trainers!');
  });

app.use(express.json());
app.use(clientRouter);
app.use(trainerRouter);
app.use(adminRouter);
app.use(availabilityRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${ port }`);
});