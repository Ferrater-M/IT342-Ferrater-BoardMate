# CEBU INSTITUTE OF TECHNOLOGY UNIVERSITY
## IT342-[Section] System Integration and Architecture
---

# System Design Document (SDD)
## Project Title: BoardMate
### Prepared By: Ferrater, Marilou T.
### Version: 0.3
### Date: 05/27/2026
### Status: Updated

---

# REVISION HISTORY TABLE

| Version | Date | Author | Changes Made | Status |
|---------|------|--------|--------------|--------|
| 0.1 | 02/21/2026 | Ferrater, Marilou T. | Initial draft | Draft |
| 0.2 | 28/02/2026 | Ferrater, Marilou T. | Added API specifications | Review |
| 0.3 | 05/27/2026 | Ferrater, Marilou T. | Updated with email verification, roles, owner applications, PostgreSQL, and more | Updated |

---

# TABLE OF CONTENTS

1. EXECUTIVE SUMMARY
2. INTRODUCTION
3. FUNCTIONAL REQUIREMENTS SPECIFICATION
4. NON-FUNCTIONAL REQUIREMENTS
5. SYSTEM ARCHITECTURE
6. API CONTRACT & COMMUNICATION
7. DATABASE DESIGN
8. UI/UX DESIGN
9. DEVELOPMENT PLAN

---

# EXECUTIVE SUMMARY

## 1.1 Project Overview
The Boarding House System (BoardMate) is a web and mobile application designed to help customers easily find suitable boarding houses by providing centralized information such as location, price, availability, and billing details. The system consists of a Spring Boot backend API, a React web application, and an Android mobile application, working together to deliver a consistent experience across platforms.

## 1.2 Objectives
1. Develop a functional Boarding House System with user authentication, boarding house listings, visit requests, and billing transparency.
2. Implement a three-tier architecture using Spring Boot (backend), React (web), and Android (mobile)
3. Create RESTful APIs for communication between all system components
4. Design a responsive user interface that works consistently across web and mobile platforms
5. Deploy all system components to production-ready environments
6. Implement secure email-based user verification
7. Support role-based access control (Users, Owners, Admins)
8. Implement owner application and approval workflow

## 1.3 Scope

### Included Features:
- User registration and authentication (email/password) with email verification
- User profile management including profile picture
- Boarding house listing with search functionality, ratings, and images
- Viewing boarding house details (price, location, availability, amenities)
- Request to visit a boarding house
- Room management (single/double rooms, availability, pricing, inclusions)
- Transparent billing display for customers and owners
- Billing management by boarding house owners with receipt generation
- Owner application system (submit, approve/reject)
- Admin panel for managing owner applications and system data
- Native Android mobile application
- Relational database using PostgreSQL (hosted on Supabase)

### Excluded Features:
- Online payment gateway integration
- Direct booking or reservation system
- Messaging or chat functionality
- Advanced financial analytics

---

# INTRODUCTION

## 1.1 Purpose
This document serves as the comprehensive design specification for the Boarding House System. It defines the functional requirements, system features, and user interactions to guide the development of the web and mobile application. The purpose of this document is to ensure that all system components are clearly defined and work together consistently to meet user needs.

---

# FUNCTIONAL REQUIREMENTS SPECIFICATION

## 2.1 Project Overview
- **Project Name**: BoardMate Boarding House System
- **Domain**: Property / Rental Management
- **Primary Users**:
  1. Customers (Students/Boarders - ROLE_USER)
  2. Boarding House Owners (ROLE_ADMIN / ROLE_OWNER)
  3. System Administrators (ROLE_ADMIN)

### Problem Statement
Customers often have difficulty finding a suitable boarding house due to limited information, and the need to visit multiple locations just to compare options. This makes the search process time-consuming and inconvenient, especially for students and workers.

### Solution
The BoardMate system provides a centralized platform where customers can easily browse available boarding houses, prices, availability, and amenities. This system simplifies the search process and helps customers find a boarding house that fits their needs faster, with secure user authentication and role-based access for different user types.

## 2.2 Core User Journeys

### Journey 1: First-time Customer Boarding House Search
1. User visits web application or mobile application
2. Clicks "Sign Up" and creates account (chooses role: Student/Boarder or Owner)
3. Receives verification email, clicks link to verify account
4. Logs in with credentials
5. Browses available boarding houses
6. Views boarding house details (price, location, amenities, ratings, availability)
7. Views available rooms in selected house
8. Submits a request to visit
9. Tracks visit request status

### Journey 2: Returning Customer
1. User logs in with existing credentials
2. Views assigned boarding house (if applicable)
3. Views monthly bill breakdown (rent, utilities, other fees)
4. Checks payment status (paid / unpaid)
5. Views billing history and receipts
6. Tracks pending visit requests

### Journey 3: Owner Application & Management
1. User registers or logs in
2. Clicks "Apply as Owner" and submits application with details (full name, phone, house name)
3. Admin reviews and approves/rejects application
4. If approved, user gains owner privileges
5. Owner creates/manages boarding house listings
6. Owner manages rooms (add, edit, update status)
7. Owner manages visit requests
8. Owner creates and manages bills/receipts for tenants

### Journey 4: Administrator Management
1. Admin logs in with admin credentials
2. Views and manages pending owner applications (approve/reject)
3. Views application history
4. Manages system users and boarding house data
5. Monitors visit requests and system activity

## 2.3 Feature List (MoSCoW)

### MUST HAVE
1. User authentication (register, login, logout) with email verification
2. User profile management (profile picture, personal details)
3. Boarding House listing (list, detail, search, ratings)
4. Room management (single/double, pricing, inclusions, status)
5. Request to visit a boarding house (status tracking)
6. Billing transparency for customers and owners
7. Billing management by boarding house owners with receipts
8. Owner application workflow (submit, approve/reject, status check)
9. Admin panel (owner application management, system overview)
10. Role-based access control (User, Owner, Admin)

### SHOULD HAVE
1. Bill breakdown display (rent, utilities, misc fees)
2. Payment status tracking (paid / unpaid)
3. Billing history view with downloadable receipts
4. Responsive design for web and mobile
5. Multiple image support for boarding houses
6. Rating system for boarding houses

### COULD HAVE
1. Downloadable bill summary and receipts (PDF)
2. Monthly bill notifications (in-app/email)
3. Advanced search and filter options
4. Favorite boarding houses list

### WON'T HAVE
1. Booking or reservation system
2. Online payment processing
3. Messaging or chat system
4. Advanced financial analytics

## 2.4 Detailed Feature Specifications

### Feature: User Authentication & Email Verification
- **Screens**: Register, Login, Verify Email, Resend Verification
- **Visible To**: All Users
- **Data Collected**: Email, Password, First Name, Last Name, Role
- **Functions**:
  - User registration with role selection
  - Email verification via token-based link
  - Auto-storage of unverified users in temporary storage (not added to real DB until verified)
  - Resend verification email functionality
  - Manual email verification for debugging purposes
- **API Endpoints**:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/verify-email?token=
  - POST /api/auth/resend-verification
  - POST /api/auth/debug/verify-email

### Feature: Profile Management
- **Screens**: Profile Page, Profile Picture Upload
- **Visible To**: All Users
- **Functions**:
  - View profile information
  - Upload/update profile picture
- **API Endpoints**:
  - GET /api/auth/me
  - POST /api/auth/profile-picture

### Feature: Owner Application System
- **Screens**: Owner Application Form, Admin Dashboard (Pending/History Applications)
- **Visible To**:
  - Users (applying)
  - Admins (approving/rejecting)
- **Data Collected**: Full Name, Email, Phone Number, House Name
- **Functions**:
  - Submit owner application
  - View application status
  - Admin approves/rejects applications
  - Upon approval, user role upgraded to ROLE_ADMIN
  - View application history
- **API Endpoints**:
  - POST /api/auth/applications/apply
  - GET /api/auth/application-status
  - GET /api/auth/applications/pending
  - GET /api/auth/applications/history
  - POST /api/auth/applications/approve
  - POST /api/auth/applications/reject

### Feature: Boarding House & Room Management
- **Screens**: House List, House Details, Room List, Room Details
- **Visible To**:
  - Users (viewing)
  - Owners (managing)
- **Functions**:
  - View all boarding houses with ratings and images
  - View house details (location, description, price, amenities)
  - View rooms in a house (type, price, inclusions, status)
  - Owners can create/edit houses and rooms
- **API Endpoints**:
  - GET /api/houses
  - GET /api/houses/{id}
  - POST /api/houses (owner only)
  - PUT /api/houses/{id} (owner only)
  - GET /api/houses/{houseId}/rooms
  - GET /api/rooms/{id}
  - POST /api/houses/{houseId}/rooms (owner only)
  - PUT /api/rooms/{id} (owner only)

### Feature: Visit Requests
- **Screens**: Request Visit Form, My Visits List
- **Visible To**:
  - Users (submitting/viewing)
  - Owners (managing)
- **Data Collected**: Requested Date/Time, Optional Message
- **Statuses**: PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
- **Functions**:
  - Submit visit request
  - Track request status
  - Owners can approve/reject requests
- **API Endpoints**:
  - POST /api/visits
  - GET /api/visits/my
  - GET /api/visits/{id}
  - PUT /api/visits/{id}/status

### Feature: Billing & Receipts
- **Screens**: Billing Overview, Bill Detail, Receipts List
- **Visible To**:
  - Users (viewing)
  - Owners (managing)
- **Bill Components**: Monthly rent, Utilities (water, electricity), Other fixed charges
- **Functions**:
  - Customer: View bill breakdown, View payment status, View billing history and receipts
  - Owner: Create and update bills, Mark bills as paid/unpaid, Generate receipts, View all customer billing records
- **API Endpoints**:
  - GET /api/bills
  - GET /api/bills/{id}
  - POST /api/bills (owner only)
  - PUT /api/bills/{id}/status (owner only)
  - GET /api/receipts
  - GET /api/receipts/{id}

### Feature: Admin Panel
- **Screens**: Admin Dashboard
- **Functions**:
  - View pending owner applications
  - Approve or reject applications
  - View application history
  - System overview
- **Access Control**: Admin role required
- **API Endpoints**: All admin-protected endpoints with role validation

## 2.5 Acceptance Criteria

### AC-1: Customer Registration & Email Verification
- Given I am a new user
- When I register with my email and choose a role
- Then I should receive a verification email
- And I am stored in temporary storage (not yet in the real database)
- When I click the verification link
- Then my account is verified
- And I am moved to the real database
- And I can log in

### AC-2: Customer Bill Transparency
- Given I am logged in as a customer
- When I view my billing section
- Then I should see a clear breakdown of my monthly bill
- And the current payment status
- And I can view my receipts

### AC-3: Owner Application Workflow
- Given I am logged in as a user
- When I submit an owner application
- Then the application is submitted with status PENDING
- And admins can view it in their dashboard
- When an admin approves my application
- Then my role is upgraded to ROLE_ADMIN
- And I can access owner features

### AC-4: Admin Bill Management
- Given I am logged in as an administrator or owner
- When I create or update a bill
- Then the updated bill should be visible to the customer

### AC-5: Consistent Billing Records
- Given a bill is updated by the administrator/owner
- When the customer views the bill
- Then both sides should see the same billing information

---

# NON-FUNCTIONAL REQUIREMENTS

## 3.1 Performance Requirements
- API response time: ≤ 2 seconds for 95% of requests
- Web page load time: ≤ 3 seconds on broadband
- Mobile app cold start: ≤ 3 seconds
- Support 100 concurrent users
- Database queries complete within 500ms

## 3.2 Security Requirements
- HTTPS for all communications
- JWT token authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- Rate limiting: 100 requests/minute per IP
- Admin/Owner endpoints require role verification
- Email verification for all new accounts
- Unverified users stored separately (not in main database)

## 3.3 Compatibility Requirements
- Web Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Android: API Level 24+ (Android 7.0+)
- Screen Sizes: Mobile (360px+), Tablet (768px+), Desktop (1024px+)
- Operating Systems: Windows 10+, macOS 10.15+, Linux Ubuntu 20.04+

## 3.4 Usability Requirements
- New users should be able to browse boarding houses and submit a visit request within 5 minutes
- WCAG 2.1 Level AA compliance for web
- Consistent navigation across all pages
- Clear error messages with recovery options
- Touch targets minimum 44x44px on mobile
- Keyboard navigation support

---

# SYSTEM ARCHITECTURE

## 4.1 Component Diagram
Presentation Tier
Three-Tier Architecture

### Technology Stack:
- **Backend**: Java 17, Spring Boot 3.5.11, Spring Security, Spring Data JPA, JWT
- **Database**: PostgreSQL 17.6 (hosted on Supabase)
- **Web Frontend**: React 19.2.4, React Router, React Icons, Axios
- **Mobile**: Kotlin, Jetpack Compose, Retrofit, Glide, Coil, Material3
- **Build Tools**: Maven (Backend), npm (Web), Gradle (Android)
- **Email**: Gmail SMTP for verification emails

---

# API CONTRACT & COMMUNICATION

## 5.1 API Standards
| Base URL | http://localhost:8080/api |
|----------|----------------------------|
| Format | JSON for all requests/responses |
| Authentication | Bearer token (JWT) in Authorization header |

## 5.2 Authentication Endpoints

### User Registration
| Description | User Registration with Role Selection |
|-------------|---------------------------------------|
| API URL | /auth/register |
| HTTP Method | POST |
| Authentication | None |
| Request Payload | { "email": string, "password": string, "role": string ("ROLE_USER" or "ROLE_ADMIN"), "firstName": string, "lastName": string } |
| Response | { "message": "Registration successful! Please check your email to verify your account." } |

### User Login
| Description | User Login |
|-------------|------------|
| API URL | /auth/login |
| HTTP Method | POST |
| Authentication | None |
| Request Payload | { "email": string, "password": string } |
| Response | { "token": string, "user": { "id": number, "email": string, "firstName": string, "lastName": string, "role": string, "profilePicture": string } } |

### Verify Email
| Description | Verify Email with Token |
|-------------|-------------------------|
| API URL | /auth/verify-email |
| HTTP Method | GET |
| Authentication | None |
| Query Parameter | ?token=string |
| Response | { "message": "Email verified successfully" } |

### Resend Verification Email
| Description | Resend Verification Email |
|-------------|--------------------------|
| API URL | /auth/resend-verification |
| HTTP Method | POST |
| Authentication | None |
| Request Payload | { "email": string } |
| Response | { "message": "Verification email resent" } |

### Get Current User
| Description | Get Authenticated User Info |
|-------------|------------------------------|
| API URL | /auth/me |
| HTTP Method | GET |
| Authentication | Bearer Token |
| Response | User object |

### Update Profile Picture
| Description | Update User Profile Picture |
|-------------|------------------------------|
| API URL | /auth/profile-picture |
| HTTP Method | POST |
| Authentication | Bearer Token |
| Request Payload | { "imageUrl": string } |
| Response | { "message": "Profile picture updated" } |

### Debug: Manually Verify Email
| Description | Manually Verify Email (for development) |
|-------------|------------------------------------------|
| API URL | /auth/debug/verify-email |
| HTTP Method | POST |
| Authentication | None |
| Request Payload | { "email": string } |
| Response | { "message": "Email verified (debug mode)" } |

### Upgrade to Admin (Owner Approval)
| Description | Upgrade User to Admin Role |
|-------------|-----------------------------|
| API URL | /auth/upgrade-to-admin |
| HTTP Method | POST |
| Authentication | Bearer Token (Admin) |
| Request Payload | { "email": string } |
| Response | { "message": "User upgraded to admin" } |

## 5.3 Owner Application Endpoints

### Submit Owner Application
| Description | Submit Application to Become Owner |
|-------------|-------------------------------------|
| API URL | /auth/applications/apply |
| HTTP Method | POST |
| Authentication | Bearer Token |
| Request Payload | { "fullName": string, "phoneNumber": string, "houseName": string } |
| Response | { "message": "Application submitted" } |

### Get Application Status
| Description | Get Current User's Application Status |
|-------------|----------------------------------------|
| API URL | /auth/application-status |
| HTTP Method | GET |
| Authentication | Bearer Token |
| Response | { "status": string ("NONE", "PENDING", "APPROVED", "REJECTED") } |

### Get Pending Applications (Admin)
| Description | Get All Pending Owner Applications |
|-------------|--------------------------------------|
| API URL | /auth/applications/pending |
| HTTP Method | GET |
| Authentication | Bearer Token (Admin) |
| Response | Array of application objects |

### Get Application History (Admin)
| Description | Get Application History |
|-------------|--------------------------|
| API URL | /auth/applications/history |
| HTTP Method | GET |
| Authentication | Bearer Token (Admin) |
| Response | Array of application objects |

### Approve Application (Admin)
| Description | Approve Owner Application |
|-------------|----------------------------|
| API URL | /auth/applications/approve |
| HTTP Method | POST |
| Authentication | Bearer Token (Admin) |
| Request Payload | { "email": string } |
| Response | { "message": "Application approved" } |

### Reject Application (Admin)
| Description | Reject Owner Application |
|-------------|---------------------------|
| API URL | /auth/applications/reject |
| HTTP Method | POST |
| Authentication | Bearer Token (Admin) |
| Request Payload | { "email": string } |
| Response | { "message": "Application rejected" } |

## 5.4 Error Handling
### HTTP Status Codes
- 200 OK - Successful request
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Authentication required/failed
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Duplicate resource
- 500 Internal Server Error - Server error

---

# DATABASE DESIGN

## 6.1 Entity Relationship Diagram
### Key Entities and Relationships:
- **One-to-Many**: User → Houses (An owner can manage multiple boarding houses)
- **One-to-Many**: User → VisitRequests (A customer can submit multiple visit requests)
- **One-to-Many**: House → VisitRequests (A boarding house can receive multiple visit requests)
- **One-to-Many**: House → Rooms (A house has multiple rooms)
- **One-to-Many**: Room → BillingReceipts (A room can have multiple bills/receipts)
- **Many-to-One**: VisitRequest → User (Customer)
- **Many-to-One**: VisitRequest → House
- **Many-to-One**: Room → House
- **Many-to-One**: Room → User (Occupant)
- **Many-to-One**: BillingReceipt → Room

## 6.2 Core Tables

### users
Stores all verified users (customers, owners, admins). Unverified users are stored in temporary memory only.
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | BCrypt-hashed password |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| role | VARCHAR(50) | User role (ROLE_USER, ROLE_ADMIN, ROLE_OWNER) |
| profile_picture | TEXT | Profile picture URL |
| email_verified | BOOLEAN | Whether email is verified (always true for users in this table) |
| verification_token | VARCHAR(255) | Verification token (null for verified users) |
| created_at | TIMESTAMP | Account creation timestamp |

### house_details
Stores boarding house listings
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| name | VARCHAR(255) | House name |
| location | VARCHAR(255) | House address/location |
| description | TEXT | House description |
| price | DECIMAL(10,2) | Starting price |
| rating | DECIMAL(3,2) | Average rating |
| rooms_left | INT | Number of available rooms |
| image_url | TEXT | Main image URL |
| image_urls | TEXT[] | Array of additional image URLs |
| owner_id | BIGINT | Foreign Key → users.id |

### rooms
Stores individual rooms in boarding houses
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| room_number | VARCHAR(50) | Room number/identifier |
| type | VARCHAR(50) | Room type (SINGLE, DOUBLE) |
| price | DECIMAL(10,2) | Monthly rent |
| inclusions | TEXT | Included amenities (comma-separated) |
| status | VARCHAR(50) | Room status (AVAILABLE, OCCUPIED) |
| payment_status | VARCHAR(50) | Payment status (PAID, UNPAID) |
| billing_month | VARCHAR(50) | Current billing month |
| house_id | BIGINT | Foreign Key → house_details.id |
| occupant_id | BIGINT | Foreign Key → users.id (occupant, if any) |

### visit_requests
Stores visit requests from customers
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| user_id | BIGINT | Foreign Key → users.id (customer) |
| house_id | BIGINT | Foreign Key → house_details.id |
| requested_date_time | TIMESTAMP | Requested visit date & time |
| message | TEXT | Optional message from customer |
| status | VARCHAR(50) | Request status (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED) |
| created_at | TIMESTAMP | Request submission timestamp |

### ratings
Stores ratings for boarding houses
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| house_id | BIGINT | Foreign Key → house_details.id |
| user_id | BIGINT | Foreign Key → users.id |
| rating | INT | Rating (1-5) |
| comment | TEXT | Optional comment |
| created_at | TIMESTAMP | Rating submission timestamp |

### billing_receipts
Stores billing records and receipts
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| room_id | BIGINT | Foreign Key → rooms.id |
| billing_month | VARCHAR(50) | Billing month |
| total_amount | DECIMAL(10,2) | Total bill amount |
| status | VARCHAR(50) | Payment status (PAID, UNPAID) |
| receipt_url | TEXT | Receipt document URL |
| created_at | TIMESTAMP | Bill creation timestamp |

---

# UI/UX DESIGN

## 7.1 Web Application Pages & Screens

### Authentication Flow
- **Register**: Email, Password, First Name, Last Name, Role selector (Student/Boarder or Boarding House Owner)
- **Login**: Email, Password
- **Verify Email**: Confirmation page with link to login
- **Resend Verification**: Form to resend verification email

### Customer Screens
- **Dashboard**: Browse boarding houses, search/filter
- **House Details**: House info, images, ratings, amenities
- **Rooms List**: Available rooms in selected house with details
- **Room Details**: Room info, price, inclusions
- **My Visits**: Track visit requests with status
- **My Billing**: View bills and receipts
- **Profile**: View/edit profile, upload profile picture

### Owner Screens
- **Owner Dashboard**: Overview of owned houses
- **Manage House**: Create/edit house details
- **Manage Rooms**: Add/edit rooms, update status
- **Manage Visits**: View/respond to visit requests
- **Manage Billing**: Create bills, mark as paid, generate receipts
- **Apply as Owner**: Application form (if not yet approved)

### Admin Screens
- **Admin Dashboard**: System overview
- **Pending Applications**: Approve/reject owner applications
- **Application History**: View past applications
- **System Management**: Manage users and houses

## 7.2 Android Mobile App Activities
- LoginActivity, RegisterActivity
- DashboardActivity (customer)
- RoomsActivity, RoomDetailsActivity
- MyVisitsActivity
- OwnerDashboardActivity
- ManageRoomsActivity, EditHouseActivity, EditRoomActivity
- ReceiptsActivity, EditBillsActivity
- AdminActivity
- ApplyOwnerActivity

---

# DEVELOPMENT PLAN
1. Set up project structure (backend, frontend, mobile)
2. Configure database (PostgreSQL on Supabase)
3. Implement user authentication and email verification
4. Implement role-based access control
5. Implement boarding house and room management
6. Implement visit request system
7. Implement billing and receipt system
8. Implement owner application workflow
9. Build frontend web application
10. Build Android mobile application
11. Testing and bug fixes
12. Deployment

