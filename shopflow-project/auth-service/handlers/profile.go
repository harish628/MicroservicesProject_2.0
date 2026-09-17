package handlers

import (
	"net/http"

	"auth-service/config"
	"auth-service/models"

	"github.com/gin-gonic/gin"
)

// GetProfile handles GET /profile
// This is a PROTECTED route — only accessible with a valid JWT token
//
// What it does:
// - Reads the userID that was attached to the request by AuthMiddleware
// - Fetches that user's info from MySQL
// - Returns it (without the password — json:"-" takes care of that)
//
// Feynman version:
// Think of this like a members-only counter at a club.
// You show your wristband (token) at the door (AuthMiddleware checks it).
// Once inside, you say "show me my profile" — staff looks you up by your member ID
// and hands you your info card.
func GetProfile(c *gin.Context) {
	// AuthMiddleware already verified the token and stored userID in context
	// We just read it here — no need to validate again
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Fetch user from MySQL by ID
	var user models.User
	result := config.DB.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return user info — password is automatically hidden by json:"-" tag on the model
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// UpdateProfile handles PUT /profile
// Allows a logged-in user to update their name
func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Only allow updating name for now
	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	// Update in MySQL
	result := config.DB.Model(&models.User{}).Where("id = ?", userID).Update("name", req.Name)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
