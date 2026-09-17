package handlers

import (
	"net/http"

	"auth-service/config"
	"auth-service/middleware"
	"auth-service/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Login handles POST /login
//
// What happens here (Feynman version):
//  1. User sends: { email, password }
//  2. We look up the email in MySQL
//  3. We COMPARE the password they sent with the hashed version in DB
//  4. If match → generate JWT token → return it
//  5. If no match → reject with 401
//
// Why don't we just compare passwords directly?
// Because we NEVER store plain passwords. Remember the meat grinder?
// bcrypt.CompareHashAndPassword does this:
//   "hello123" + "$2a$10$xyz..." → runs the same grind → checks if result matches stored hash
//   It never "un-grinds" — it just grinds again and compares
func Login(c *gin.Context) {
	var req models.LoginRequest

	// Step 1: Parse the incoming JSON body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	// Step 2: Find the user by email in MySQL
	var user models.User
	result := config.DB.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		// Don't say "email not found" — that helps attackers know valid emails
		// Always say generic message for security
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Step 3: Compare the submitted password with the hashed password in DB
	// bcrypt does the heavy lifting — returns nil if match, error if no match
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Step 4: Password matched! Generate a JWT token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Step 5: Return the token + user info
	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  user,
	})
}
