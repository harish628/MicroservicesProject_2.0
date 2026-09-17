package models

import (
	"time"
)

// User represents a row in the "users" table in MySQL
// Think of this as the "template" for what data we store about each person
//
// When someone registers on our e-commerce app, we save:
//   - Their ID (auto-generated unique number)
//   - Their name
//   - Their email (must be unique — no two people share an email)
//   - Their password (stored as a HASH, never plain text — more on this in handlers)
//   - Their role: "customer" or "admin"
//   - When they joined (CreatedAt — auto-filled by GORM)
// type User struct {
// 	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
// 	Name      string    `json:"name" gorm:"not null"`
// 	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
// 	Password  string    `json:"-" gorm:"not null"` // json:"-" means NEVER send password in API response
// 	Role      string    `json:"role" gorm:"default:customer"`
// 	CreatedAt time.Time `json:"created_at"`
// 	UpdatedAt time.Time `json:"updated_at"`
// }

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"type:varchar(100);not null"`
	Email     string    `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"type:varchar(255);not null"`
	Role      string    `json:"role" gorm:"type:varchar(20);default:customer"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// RegisterRequest is what we EXPECT from the user when they sign up
// This is the shape of the JSON body: { "name": "...", "email": "...", "password": "..." }
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest is what we EXPECT when someone logs in
// Just email + password
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse is what we SEND BACK after successful login/register
// We give them a JWT token + their basic info
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
