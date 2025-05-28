
# Arbrion Platform - Developer Guide

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Database Integration](#database-integration)
6. [Backend Integration](#backend-integration)
7. [Authentication](#authentication)
8. [API Documentation](#api-documentation)
9. [Golang Backend Implementation](#golang-backend-implementation)
10. [PostgreSQL Database Setup](#postgresql-database-setup)
11. [Supabase Integration](#supabase-integration)
12. [System Architecture](#system-architecture)
13. [Deployment](#deployment)
14. [Performance & Security](#performance--security)
15. [Contributing](#contributing)

## Overview

Arbrion Platform is a comprehensive employee management system built with React, TypeScript, and modern web technologies. It provides attendance tracking, leave management, purchase order handling, and administrative features with GPS tracking and photo verification capabilities.

### Key Features
- **Role-based Authentication** (Employee/Admin)
- **Attendance Management** with GPS tracking and photo capture
- **Annual Leave Management** with approval workflow
- **Purchase Order System** with image upload and PDF generation
- **Google Maps Integration** for location tracking
- **Responsive Design** for mobile and desktop
- **Export functionality** (CSV, PDF)
- **Real-time notifications** with toast messages

## Technology Stack

### Frontend
- **React 18** - UI library with hooks and context
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **React Router DOM** - Client-side routing
- **Lucide React** - Modern icon library

### Backend Options
- **Golang** - High-performance backend API
- **Node.js** - JavaScript runtime alternative
- **Supabase** - Backend-as-a-Service platform

### Database Options
- **PostgreSQL** - Primary relational database
- **Supabase Database** - Managed PostgreSQL with real-time features

### Additional Libraries
- **@tanstack/react-query** - Data fetching and caching
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation and TypeScript integration
- **Date-fns** - Date manipulation utilities
- **Recharts** - Charts and data visualization

## Project Structure

```
arbrion-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/UI components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── ProtectedRoute.tsx
│   │   ├── ImageUpload.tsx # Image upload with camera
│   │   ├── AnnualLeaveForm.tsx
│   │   ├── PurchaseOrderForm.tsx
│   │   └── PurchaseOrderPDF.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state management
│   ├── hooks/              # Custom React hooks
│   │   ├── useAttendance.tsx
│   │   ├── useAnnualLeave.tsx
│   │   └── usePurchaseOrders.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── MyAttendance.tsx
│   │   ├── AnnualLeave.tsx
│   │   ├── EmployeeRecords.tsx
│   │   ├── PurchaseOrders.tsx
│   │   └── Profile.tsx
│   ├── types/              # TypeScript type definitions
│   │   ├── AnnualLeave.ts
│   │   └── PurchaseOrder.ts
│   └── lib/                # Utility functions
│       └── utils.ts
├── backend/                # Backend implementation
│   ├── golang/            # Go backend
│   ├── nodejs/            # Node.js alternative
│   └── database/          # Database scripts and migrations
└── docs/                  # Documentation and diagrams
```

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control

### Frontend Installation
```bash
# Clone the repository
git clone <repository-url>
cd arbrion-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Demo Credentials
- **Employee**: `employee@company.com` / `password`
- **Admin**: `admin@company.com` / `password`

## Golang Backend Implementation

### Project Structure
```
backend/golang/
├── cmd/
│   └── server/
│       └── main.go         # Application entry point
├── internal/
│   ├── api/               # API handlers and routes
│   │   ├── handlers/      # HTTP handlers
│   │   ├── middleware/    # Custom middleware
│   │   └── routes/        # Route definitions
│   ├── config/            # Configuration management
│   ├── database/          # Database connection and migrations
│   ├── models/            # Data models and structures
│   ├── services/          # Business logic layer
│   └── utils/             # Utility functions
├── pkg/                   # Public packages
├── migrations/            # Database migration files
├── go.mod                 # Go module definition
└── go.sum                 # Go module checksums
```

### Installation and Setup

```bash
# Navigate to backend directory
cd backend/golang

# Initialize Go module
go mod init arbrion-backend

# Install dependencies
go get github.com/gin-gonic/gin           # Web framework
go get github.com/lib/pq                  # PostgreSQL driver
go get github.com/golang-migrate/migrate  # Database migrations
go get github.com/joho/godotenv           # Environment variables
go get github.com/dgrijalva/jwt-go        # JWT authentication
go get github.com/gin-contrib/cors        # CORS middleware
go get gorm.io/gorm                       # ORM library
go get gorm.io/driver/postgres            # PostgreSQL driver for GORM
```

### Environment Configuration

Create `.env` file in backend/golang/:
```env
# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/arbrion_db?sslmode=disable
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=arbrion_db

# Server Configuration
PORT=8080
GIN_MODE=release

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Main Application (cmd/server/main.go)

```go
package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "arbrion-backend/internal/api/routes"
    "arbrion-backend/internal/config"
    "arbrion-backend/internal/database"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize configuration
    cfg := config.Load()

    // Initialize database
    db, err := database.Initialize(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Run migrations
    if err := database.Migrate(db); err != nil {
        log.Fatal("Failed to run migrations:", err)
    }

    // Initialize Gin router
    router := gin.Default()

    // Setup routes
    routes.SetupRoutes(router, db, cfg)

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    log.Fatal(router.Run(":" + port))
}
```

### Database Models (internal/models/models.go)

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Email     string    `json:"email" gorm:"unique;not null"`
    Name      string    `json:"name" gorm:"not null"`
    Password  string    `json:"-" gorm:"not null"`
    Role      string    `json:"role" gorm:"not null;check:role IN ('admin','employee')"`
    Avatar    string    `json:"avatar"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type AttendanceRecord struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    EmployeeID  uint      `json:"employee_id" gorm:"not null"`
    Employee    User      `json:"employee" gorm:"foreignKey:EmployeeID"`
    Type        string    `json:"type" gorm:"not null;check:type IN ('clock-in','clock-out')"`
    Timestamp   time.Time `json:"timestamp" gorm:"not null"`
    LocationLat float64   `json:"location_lat"`
    LocationLng float64   `json:"location_lng"`
    PhotoURL    string    `json:"photo_url"`
    CreatedAt   time.Time `json:"created_at"`
}

type AnnualLeave struct {
    ID           uint      `json:"id" gorm:"primaryKey"`
    EmployeeID   uint      `json:"employee_id" gorm:"not null"`
    Employee     User      `json:"employee" gorm:"foreignKey:EmployeeID"`
    StartDate    time.Time `json:"start_date" gorm:"not null"`
    EndDate      time.Time `json:"end_date" gorm:"not null"`
    Days         int       `json:"days" gorm:"not null"`
    Reason       string    `json:"reason" gorm:"not null"`
    Status       string    `json:"status" gorm:"not null;default:'pending';check:status IN ('pending','approved','rejected')"`
    AppliedDate  time.Time `json:"applied_date" gorm:"not null"`
    ApprovedBy   *uint     `json:"approved_by"`
    Approver     *User     `json:"approver" gorm:"foreignKey:ApprovedBy"`
    ApprovedDate *time.Time `json:"approved_date"`
    Comments     string    `json:"comments"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

type PurchaseOrder struct {
    ID          uint                 `json:"id" gorm:"primaryKey"`
    PONumber    string              `json:"po_number" gorm:"unique;not null"`
    Vendor      string              `json:"vendor" gorm:"not null"`
    Description string              `json:"description"`
    Status      string              `json:"status" gorm:"not null;default:'pending';check:status IN ('pending','approved','rejected','completed')"`
    TotalAmount float64             `json:"total_amount" gorm:"not null"`
    CreatedBy   uint                `json:"created_by" gorm:"not null"`
    Creator     User                `json:"creator" gorm:"foreignKey:CreatedBy"`
    Items       []PurchaseOrderItem `json:"items" gorm:"foreignKey:POId"`
    Images      []POImage           `json:"images" gorm:"foreignKey:POId"`
    CreatedAt   time.Time           `json:"created_at"`
    UpdatedAt   time.Time           `json:"updated_at"`
}

type PurchaseOrderItem struct {
    ID          uint    `json:"id" gorm:"primaryKey"`
    POId        uint    `json:"po_id" gorm:"not null"`
    Description string  `json:"description" gorm:"not null"`
    Quantity    int     `json:"quantity" gorm:"not null"`
    UnitPrice   float64 `json:"unit_price" gorm:"not null"`
    TotalPrice  float64 `json:"total_price" gorm:"not null"`
}

type POImage struct {
    ID       uint   `json:"id" gorm:"primaryKey"`
    POId     uint   `json:"po_id" gorm:"not null"`
    ImageURL string `json:"image_url" gorm:"not null"`
    Filename string `json:"filename" gorm:"not null"`
}
```

### API Handlers Example (internal/api/handlers/attendance.go)

```go
package handlers

import (
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "arbrion-backend/internal/models"
)

type AttendanceHandler struct {
    db *gorm.DB
}

func NewAttendanceHandler(db *gorm.DB) *AttendanceHandler {
    return &AttendanceHandler{db: db}
}

func (h *AttendanceHandler) ClockIn(c *gin.Context) {
    var req struct {
        LocationLat float64 `json:"location_lat"`
        LocationLng float64 `json:"location_lng"`
        PhotoURL    string  `json:"photo_url"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userID, _ := c.Get("user_id")
    
    attendance := models.AttendanceRecord{
        EmployeeID:  userID.(uint),
        Type:        "clock-in",
        Timestamp:   time.Now(),
        LocationLat: req.LocationLat,
        LocationLng: req.LocationLng,
        PhotoURL:    req.PhotoURL,
    }

    if err := h.db.Create(&attendance).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create attendance record"})
        return
    }

    c.JSON(http.StatusCreated, attendance)
}

func (h *AttendanceHandler) GetAttendanceRecords(c *gin.Context) {
    employeeID := c.Query("employee_id")
    
    var records []models.AttendanceRecord
    query := h.db.Preload("Employee")
    
    if employeeID != "" {
        if id, err := strconv.Atoi(employeeID); err == nil {
            query = query.Where("employee_id = ?", id)
        }
    }
    
    if err := query.Order("timestamp DESC").Find(&records).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch records"})
        return
    }

    c.JSON(http.StatusOK, records)
}
```

## PostgreSQL Database Setup

### Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Database Configuration

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE arbrion_db;

-- Create user
CREATE USER arbrion_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE arbrion_db TO arbrion_user;
GRANT CREATE ON SCHEMA public TO arbrion_user;

-- Exit PostgreSQL
\q
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee')),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('clock-in', 'clock-out')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Annual leave table
CREATE TABLE annual_leave (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approved_by INTEGER REFERENCES users(id),
    approved_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    total_amount DECIMAL(12, 2) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

-- Purchase order images table
CREATE TABLE po_images (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_attendance_timestamp ON attendance_records(timestamp);
CREATE INDEX idx_annual_leave_employee_id ON annual_leave(employee_id);
CREATE INDEX idx_annual_leave_status ON annual_leave(status);
CREATE INDEX idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
```

## Supabase Integration

### Setup Steps

1. **Create Supabase Project**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project
   - Note your project URL and anon key

2. **Environment Configuration**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

4. **Supabase Client Setup**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Database Schema in Supabase

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all data" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );
```

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App]
        B[Attendance Module]
        C[Leave Management]
        D[Purchase Orders]
        E[Authentication]
    end
    
    subgraph "API Layer"
        F[Golang REST API]
        G[JWT Middleware]
        H[CORS Middleware]
        I[File Upload Handler]
    end
    
    subgraph "Database Layer"
        J[(PostgreSQL)]
        K[User Management]
        L[Attendance Records]
        M[Leave Requests]
        N[Purchase Orders]
    end
    
    subgraph "External Services"
        O[GPS/Location API]
        P[Camera/Media API]
        Q[File Storage]
        R[Email Service]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    F --> H
    F --> I
    
    G --> J
    H --> J
    I --> J
    
    J --> K
    J --> L
    J --> M
    J --> N
    
    F --> O
    F --> P
    F --> Q
    F --> R
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style J fill:#e8f5e8
    style O fill:#fff3e0
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant B as Backend Service
    participant D as Database
    participant S as Storage
    
    U->>F: Clock In Request
    F->>F: Get GPS Location
    F->>F: Capture Photo (Optional)
    F->>A: POST /api/attendance/clock-in
    A->>A: Validate JWT Token
    A->>B: Forward Request
    B->>S: Store Photo
    B->>D: Save Attendance Record
    D-->>B: Confirm Save
    B-->>A: Return Response
    A-->>F: Return Success
    F-->>U: Show Success Message
```

### Component Architecture

```mermaid
graph LR
    subgraph "UI Components"
        A[Layout]
        B[ProtectedRoute]
        C[ModernButton]
        D[ImageUpload]
    end
    
    subgraph "Page Components"
        E[Dashboard]
        F[MyAttendance]
        G[AnnualLeave]
        H[PurchaseOrders]
    end
    
    subgraph "Business Logic"
        I[useAttendance]
        J[useAnnualLeave]
        K[usePurchaseOrders]
        L[AuthContext]
    end
    
    subgraph "API Layer"
        M[Attendance API]
        N[Leave API]
        O[Purchase API]
        P[Auth API]
    end
    
    E --> A
    F --> A
    G --> A
    H --> A
    
    F --> I
    G --> J
    H --> K
    
    I --> M
    J --> N
    K --> O
    L --> P
    
    style A fill:#bbdefb
    style I fill:#c8e6c9
    style M fill:#ffcdd2
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "employee",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

#### POST /api/auth/logout
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### Attendance Endpoints

#### POST /api/attendance/clock-in
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "location_lat": -6.2088,
  "location_lng": 106.8456,
  "photo_url": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "id": 123,
  "employee_id": 1,
  "type": "clock-in",
  "timestamp": "2024-01-15T09:00:00Z",
  "location_lat": -6.2088,
  "location_lng": 106.8456,
  "photo_url": "https://example.com/photo.jpg"
}
```

#### GET /api/attendance/records
**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `employee_id` (optional): Filter by employee ID
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 123,
    "employee_id": 1,
    "employee": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "type": "clock-in",
    "timestamp": "2024-01-15T09:00:00Z",
    "location_lat": -6.2088,
    "location_lng": 106.8456,
    "photo_url": "https://example.com/photo.jpg"
  }
]
```

### Annual Leave Endpoints

#### POST /api/annual-leave
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "days": 5,
  "reason": "Family vacation"
}
```

**Response:**
```json
{
  "id": 456,
  "employee_id": 1,
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "days": 5,
  "reason": "Family vacation",
  "status": "pending",
  "applied_date": "2024-01-15"
}
```

#### PUT /api/annual-leave/:id/approve
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "comments": "Approved for vacation period"
}
```

**Response:**
```json
{
  "id": 456,
  "status": "approved",
  "approved_by": 2,
  "approved_date": "2024-01-16",
  "comments": "Approved for vacation period"
}
```

### Purchase Order Endpoints

#### POST /api/purchase-orders
**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
po_number: PO-2024-001
vendor: ABC Supplier
description: Office supplies
total_amount: 1500.00
items: [{"description":"Laptops","quantity":2,"unit_price":750.00}]
images: [file1.jpg, file2.jpg]
```

**Response:**
```json
{
  "id": 789,
  "po_number": "PO-2024-001",
  "vendor": "ABC Supplier",
  "description": "Office supplies",
  "total_amount": 1500.00,
  "status": "pending",
  "items": [
    {
      "id": 1,
      "description": "Laptops",
      "quantity": 2,
      "unit_price": 750.00,
      "total_price": 1500.00
    }
  ],
  "images": [
    {
      "id": 1,
      "image_url": "https://example.com/uploads/file1.jpg",
      "filename": "file1.jpg"
    }
  ]
}
```

## Performance & Security

### Performance Optimization

#### Frontend
```typescript
// Code splitting with React.lazy
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));

// Memoization for expensive calculations
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return heavyCalculation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// React Query for caching
const { data, isLoading } = useQuery({
  queryKey: ['attendance', employeeId],
  queryFn: () => fetchAttendance(employeeId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### Backend
```go
// Database connection pooling
func setupDatabase() *gorm.DB {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    sqlDB, _ := db.DB()
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db
}

// Redis caching
func cacheMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        key := "cache:" + c.Request.URL.Path
        if cached, err := redisClient.Get(key).Result(); err == nil {
            c.Data(200, "application/json", []byte(cached))
            return
        }
        c.Next()
    }
}
```

### Security Implementation

#### JWT Authentication
```go
func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(401, gin.H{"error": "Missing authorization header"})
            c.Abort()
            return
        }
        
        tokenString = strings.Replace(tokenString, "Bearer ", "", 1)
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        claims := token.Claims.(jwt.MapClaims)
        c.Set("user_id", uint(claims["user_id"].(float64)))
        c.Next()
    }
}
```

#### Input Validation
```go
type CreateAttendanceRequest struct {
    LocationLat float64 `json:"location_lat" binding:"required,min=-90,max=90"`
    LocationLng float64 `json:"location_lng" binding:"required,min=-180,max=180"`
    PhotoURL    string  `json:"photo_url" binding:"omitempty,url"`
}

func (h *AttendanceHandler) ClockIn(c *gin.Context) {
    var req CreateAttendanceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    // Process request...
}
```

#### File Upload Security
```go
func secureFileUpload(c *gin.Context) {
    file, header, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": "No file uploaded"})
        return
    }
    
    // Validate file type
    allowedTypes := map[string]bool{
        "image/jpeg": true,
        "image/png":  true,
        "image/gif":  true,
    }
    
    contentType := header.Header.Get("Content-Type")
    if !allowedTypes[contentType] {
        c.JSON(400, gin.H{"error": "Invalid file type"})
        return
    }
    
    // Validate file size (10MB max)
    if header.Size > 10*1024*1024 {
        c.JSON(400, gin.H{"error": "File too large"})
        return
    }
    
    // Generate secure filename
    filename := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
    filepath := filepath.Join("uploads", filename)
    
    if err := c.SaveUploadedFile(header, filepath); err != nil {
        c.JSON(500, gin.H{"error": "Failed to save file"})
        return
    }
    
    c.JSON(200, gin.H{"filename": filename, "url": "/uploads/" + filename})
}
```

## Deployment

### Docker Deployment

#### Frontend Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/.env .

EXPOSE 8080
CMD ["./main"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8080/api

  backend:
    build:
      context: ./backend/golang
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgres://arbrion_user:password@postgres:5432/arbrion_db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: arbrion_db
      POSTGRES_USER: arbrion_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Deployment

#### AWS ECS with Terraform
```hcl
# infrastructure/main.tf
resource "aws_ecs_cluster" "arbrion_cluster" {
  name = "arbrion-cluster"
}

resource "aws_ecs_service" "arbrion_backend" {
  name            = "arbrion-backend"
  cluster         = aws_ecs_cluster.arbrion_cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }
}

resource "aws_rds_instance" "postgres" {
  identifier     = "arbrion-postgres"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  allocated_storage = 20

  db_name  = "arbrion_db"
  username = "arbrion_user"
  password = var.db_password

  skip_final_snapshot = true
}
```

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: arbrion-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: arbrion-backend
  template:
    metadata:
      labels:
        app: arbrion-backend
    spec:
      containers:
      - name: backend
        image: arbrion/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
---
apiVersion: v1
kind: Service
metadata:
  name: arbrion-backend-service
spec:
  selector:
    app: arbrion-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Contributing

### Development Workflow

1. **Fork and Clone**
```bash
git clone https://github.com/yourusername/arbrion-platform.git
cd arbrion-platform
```

2. **Create Feature Branch**
```bash
git checkout -b feature/new-feature-name
```

3. **Development Setup**
```bash
# Frontend
npm install
npm run dev

# Backend
cd backend/golang
go mod download
go run cmd/server/main.go
```

4. **Testing**
```bash
# Frontend tests
npm run test

# Backend tests
go test ./...
```

5. **Code Quality**
```bash
# Frontend linting
npm run lint
npm run format

# Backend formatting
go fmt ./...
go vet ./...
```

### Coding Standards

#### TypeScript/React
- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful tests

#### Go Backend
- Follow Go conventions and idioms
- Use meaningful variable and function names
- Implement proper error handling
- Write comprehensive tests
- Document public APIs

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add appropriate commit messages
4. Submit pull request with detailed description
5. Address review feedback promptly

## Troubleshooting

### Common Issues

#### Frontend Issues
```bash
# Build failures
npm ci --legacy-peer-deps
npm run build --verbose

# Port conflicts
lsof -ti:5173 | xargs kill -9
npm run dev -- --port 3001
```

#### Backend Issues
```bash
# Database connection issues
go test -v ./internal/database

# Module dependency issues
go mod tidy
go mod verify
```

#### Database Issues
```sql
-- Check connections
SELECT * FROM pg_stat_activity WHERE datname = 'arbrion_db';

-- Reset sequences
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
```

### Monitoring and Logging

#### Application Metrics
```go
// Prometheus metrics
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
)

func metricsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        duration := time.Since(start)
        
        httpRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            string(c.Writer.Status()),
        ).Inc()
    }
}
```

#### Structured Logging
```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("User logged in",
    zap.String("user_id", userID),
    zap.String("ip", clientIP),
    zap.Duration("response_time", duration),
)
```

For additional support and detailed API documentation, refer to the inline code comments and OpenAPI specifications in the `/docs` directory.

---

This comprehensive developer guide provides everything needed to understand, develop, deploy, and maintain the Arbrion Platform. The system is designed to be scalable, maintainable, and secure while providing excellent user experience across all devices.
