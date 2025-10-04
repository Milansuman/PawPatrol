# PawPatrol API Routes

## Authentication Routes (`/auth`)

### POST `/auth/register`
Register a new user
- **Body**: `{ name: string, password: string, type?: 'civilian' | 'shelter', shelterId?: string }`
- **Response**: `{ user: UserObject, token: string }`

### POST `/auth/login`
Login user
- **Body**: `{ name: string, password: string }`
- **Response**: `{ user: UserObject, token: string }`

## User Routes (`/users`) - Requires Authentication

### GET `/users/me`
Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `UserObject`

### GET `/users`
Get all users
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `UserObject[]`

### GET `/users/:id`
Get user by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `UserObject`

### PUT `/users/me`
Update current user
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name: string }`
- **Response**: `UserObject`

### DELETE `/users/me`
Delete current user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

## Shelter Routes (`/shelters`) - Requires Authentication

### GET `/shelters`
Get all shelters
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `ShelterObject[]`

### GET `/shelters/:id`
Get shelter by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `ShelterObject`

### POST `/shelters` - Shelter Only
Create new shelter
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name: string, location: GeoJSON }`
- **Response**: `ShelterObject`

### PUT `/shelters/:id` - Shelter Only
Update shelter
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name?: string, location?: GeoJSON }`
- **Response**: `ShelterObject`

### DELETE `/shelters/:id` - Shelter Only
Delete shelter
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

## Dog Report Routes (`/dog-reports`) - Requires Authentication

### GET `/dog-reports`
Get all dog reports
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `DogReportObject[]`

### GET `/dog-reports/:id`
Get dog report by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `DogReportObject`

### GET `/dog-reports/my-reports`
Get current user's reports
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `DogReportObject[]`

### POST `/dog-reports`
Create new dog report
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ location: GeoJSON, count?: number, aggressiveness?: number }`
- **Response**: `DogReportObject`

### PUT `/dog-reports/:id`
Update dog report (own reports or shelter users)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ location?: GeoJSON, count?: number, aggressiveness?: number, status?: string }`
- **Response**: `DogReportObject`

### DELETE `/dog-reports/:id`
Delete dog report (own reports or shelter users)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

### PATCH `/dog-reports/:id/status` - Shelter Only
Update report status
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ status: string }`
- **Response**: `DogReportObject`

## Dog Report Media Routes (`/dog-report-media`) - Requires Authentication

### GET `/dog-report-media/report/:reportId`
Get media for a report
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `MediaObject[]`

### GET `/dog-report-media/:id`
Get media by ID
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `MediaObject`

### POST `/dog-report-media`
Add media to report (own reports or shelter users)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ dogReportId: string, url: string, mime: string }`
- **Response**: `MediaObject`

### PUT `/dog-report-media/:id`
Update media (own reports or shelter users)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ url?: string, mime?: string }`
- **Response**: `MediaObject`

### DELETE `/dog-report-media/:id`
Delete media (own reports or shelter users)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

## Authentication

All routes except `/auth/register` and `/auth/login` require authentication via Bearer token in the Authorization header.

Some routes are restricted to shelter users only, as indicated above.

Users can only modify their own resources (reports, media) unless they are shelter users who have elevated permissions.