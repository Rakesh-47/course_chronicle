# Exam Repository System

A platform for uploading, sharing, and discovering university exam papers, built with **React**, **Node.js/Express**, and **MongoDB**. The system uses AI (Google Gemini) to extract and structure questions from uploaded images or PDFs, supports real-time notifications, credit-based access, and features a modern, responsive UI.

## Features

- **User Authentication**: Secure signup and login with JWT.
- **Paper Upload**: Upload exam papers as images or PDFs. AI extracts questions and metadata.
- **Automatic Parsing**: Uses Google Gemini to parse and structure questions, course info, and exam metadata.
- **Duplicate Detection**: Prevents duplicate uploads and notifies users if a paper already exists.
- **Credit System**: Users earn credits for uploading valid papers and spend credits to unlock answers.
- **Real-Time Notifications**: Dashboard polls for new notifications (paper approval, rejection, duplicate, etc.).
- **Recommendations**: Personalized paper recommendations on the dashboard.
- **Search & Browse**: Find papers by course, session, year, or exam type.
- **Responsive UI**: Built with React, Tailwind CSS, and Material Tailwind for a modern look.
- **Subscription & Payments**: Buy credits via Razorpay integration (test mode).

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Material Tailwind, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI Integration**: Google Gemini API for question extraction
- **Authentication**: JWT-based, with protected routes
- **File Uploads**: Multer for handling images and PDFs
- **Payment Gateway**: Razorpay (test mode)
- **Other**: ESLint, Vite, dotenv

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/nishantlamba29/Exam-Repository-System.git
cd Exam-Repository-System
```

#### 2. Backend Setup

```bash
cd Backend
# Create a .env file with your MongoDB URI and Gemini API key
nodemon index.js
```

#### 3. Frontend Setup

```bash
cd ../Frontend
npm install
npm run dev
```

#### 4. Environment Variables

Set the following environment variables in your `.env` file inside the `Backend` directory:

```env
GEMINI_KEY=your_google_gemini_api_key
RAZORPAY_KEY=your_razorpay_api_key
RAZORPAY_TEST_SECRET=your_razorpay_test_secret
```

Set the following environment variables in your `.env` file inside the `Frontend` directory:

```env
VITE_RAZORPAY_TEST=your_razorpay_test_key
```

## Usage

- **Upload Paper**: Go to Upload, select an image or PDF, and submit. You'll be notified when processing is complete.
- **Dashboard**: View notifications (approval, rejection, duplicate), credit balance, and recommendations.
- **Browse Papers**: Search and filter by course, session, year, or exam type.
- **Unlock Answers**: Spend credits to unlock answers for specific questions.


