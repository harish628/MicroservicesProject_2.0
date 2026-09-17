package handlers

import (
	"net/http"

	"auth-service/config"
	"auth-service/middleware"
	"auth-service/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Register handles POST /register
//
// What happens here (Feynman version):
//  1. User sends: { name, email, password }
//  2. We check: is that email already taken?
//  3. We HASH the password (never store plain text — imagine your diary with a lock)
//  4. We save the new user to MySQL
//  5. We generate a JWT token
//  6. We return the token + user info
//
// What is password hashing?
// Imagine you write your password "hello123" on paper.
// Hashing is like putting it through a meat grinder — what comes out looks nothing like the original.
// "hello123" → "$2a$10$xyz...gibberish..."
// Even WE can't reverse it. When they login, we grind their input again and compare the two grinded versions.
func Register(c *gin.Context) {
	var req models.RegisterRequest

	// Step 1: Parse the incoming JSON body
	// binding:"required" means Gin will auto-validate required fields
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Step 2: Check if email already exists in the database
	var existingUser models.User
	result := config.DB.Where("email = ?", req.Email).First(&existingUser)
	if result.Error == nil {
		// Found a user with this email — reject
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Step 3: Hash the password using bcrypt
	// Cost factor 12 = how many times it's "ground" — higher = slower = harder to crack
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Step 4: Create the user record
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     "customer", // default role for new signups
	}

	// Save to MySQL — GORM handles the INSERT SQL
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Step 5: Generate JWT token for the new user
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Step 6: Return success response
	// Notice: the User struct has json:"-" on Password, so it's never sent back
	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  user,
	})
}
