# 💬Whisp - Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for instant messaging.

![Whisp Chat App](https://i.ibb.co/2YvLbj6s/Screenshot-2025-05-22-012544.png)

## ✨ Features

- ⚡ **Real-time messaging** using Socket.io  
- 🔐 **User authentication** with JWT  
- 🟢 **Online status indicators** for users  
- 🖼️ **Profile customization** with Cloudinary image uploads  
- 🗂️ **Persistent message history** stored in MongoDB  
- 📱💻 **Responsive UI** that works on mobile and desktop  

## 🛠️ Tech Stack

### 🎨 Frontend
- ⚛️ React with Vite  
- 📦 Zustand for state management  
- 🔌 Socket.io client for real-time communication  
- 🌐 Axios for API requests  
- 🔔 React Hot Toast for notifications

### 🧪 Backend
- 🟩 Node.js with Express  
- 🍃 MongoDB with Mongoose ODM  
- 🔐 JWT for authentication  
- 🔄 Socket.io for real-time events  
- 🔒 Bcrypt for password encryption  
- ☁️ Cloudinary for image storage  

## 🚀 Live Demo

- 🌐 Frontend: [https://whisp-opal.vercel.app](https://whisp-opal.vercel.app)
- ⚙️ Backend API: [https://whisp-50wo.onrender.com](https://whisp-50wo.onrender.com)

## 🧑‍💻 Installation and Setup

### 📋 Prerequisites
- Node.js (v14 or later)
- MongoDB account or local MongoDB installation
- Cloudinary account for image uploads

### 🛠️ Local Development

  1. *Clone the repository :*


  ```
   git clone https://github.com/yourusername/chat-app-full-stack.git
   cd chat-app-full-stack
   ```
  

2. *Set up environment variables:*

   Create .env file in the backend directory:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

3.    *Install dependencies and start development servers:*

#### Install backend dependencies
```
cd backend
npm install
```

#### Install frontend dependencies
```
cd ../frontend
npm install
```

#### Start backend server (from root directory)
```
cd ../backend
npm run dev
```

#### Start frontend server (in another terminal)
```
cd ../frontend
npm run dev
```

4. Open your browser and navigate to ```http://localhost:5173```

## 📦 Deployment

This project is configured for deployment on **Vercel (frontend)** and **Render (backend)**:

```
# From root directory
npm run build  # Builds the project for production
npm start      # Starts the backend server
```

## 🔐 Authentication Flow

1. 👤 User registers or logs in
2. 🧠 Server validates credentials and generates JWT token
3. 📦 Token is stored in localStorage and sent with requests
4. ✅ Protected routes check token validity   

  
**Developed with ❤️ by Danish**
