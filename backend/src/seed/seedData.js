import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import Review from '../models/Review.js';
import InvestmentRequest from '../models/InvestmentRequest.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Idea.deleteMany({}),
    Review.deleteMany({}),
    InvestmentRequest.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const [admin, startup1, startup2, mentor, investor1, investor2] = await User.create([
    { name: 'Ava Admin', email: 'admin@portal.com', password: 'Password123!', role: 'admin' },
    { name: 'Sam Founder', email: 'startup1@portal.com', password: 'Password123!', role: 'startup' },
    { name: 'Nina Builder', email: 'startup2@portal.com', password: 'Password123!', role: 'startup' },
    { name: 'Maya Mentor', email: 'mentor@portal.com', password: 'Password123!', role: 'mentor' },
    { name: 'Ivan Investor', email: 'investor1@portal.com', password: 'Password123!', role: 'investor' },
    { name: 'Iris Capital', email: 'investor2@portal.com', password: 'Password123!', role: 'investor' }
  ]);

  const ideas = await Idea.create([
    {
      title: 'AI Logistics Optimizer',
      description: 'AI platform that reduces last-mile delivery costs through demand prediction and route intelligence.',
      industry: 'Logistics',
      stage: 'mvp',
      teamSize: 5,
      fundingNeeded: 400000,
      status: 'approved',
      rating: 4,
      feedback: 'Strong unit economics and clear market fit.',
      userId: startup1._id
    },
    {
      title: 'HealthTrack Rural',
      description: 'Remote monitoring and telehealth suite focused on underserved rural clinics with low-bandwidth architecture.',
      industry: 'HealthTech',
      stage: 'concept',
      teamSize: 3,
      fundingNeeded: 250000,
      status: 'pending',
      userId: startup1._id
    },
    {
      title: 'GreenBrick Materials',
      description: 'Sustainable construction materials from recycled composites for affordable housing builders.',
      industry: 'ClimateTech',
      stage: 'early-revenue',
      teamSize: 8,
      fundingNeeded: 900000,
      status: 'approved',
      rating: 5,
      feedback: 'Excellent traction and clear go-to-market.',
      userId: startup2._id
    }
  ]);

  await Review.create({
    ideaId: ideas[0]._id,
    reviewerId: mentor._id,
    rating: 4,
    feedback: 'Promising business with scalable operations.',
    approved: true
  });

  await InvestmentRequest.create([
    {
      ideaId: ideas[0]._id,
      investorId: investor1._id,
      amount: 200000,
      partnershipType: 'equity',
      status: 'pending'
    },
    {
      ideaId: ideas[2]._id,
      investorId: investor2._id,
      amount: 350000,
      partnershipType: 'convertible',
      status: 'accepted'
    }
  ]);

  console.log('Seed completed. Test accounts:');
  console.log('admin@portal.com | mentor@portal.com | startup1@portal.com | investor1@portal.com');
  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
