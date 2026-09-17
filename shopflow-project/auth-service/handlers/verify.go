package handlers

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"auth-service/middleware"
)

// VerifyToken handles GET /verify-token
//
// This endpoint is VERY important in microservices.
// Other services (Order, Product, Payment) don't know how to read JWT tokens.
// So they call THIS endpoint and ask: "Hey Auth Service, is this token valid?"
//
// Feynman analogy:
// Imagine a nightclub. The bouncer (API Gateway) lets people in with a wristband.
// Inside, when someone orders a drink, the bartender (Order Service) isn't sure
// if the wristband is real. So he calls the bouncer's phone: "Is wristband #XYZ legit?"
// The bouncer says "Yes, that's UserID 42, role=customer" — and the bartender serves them.
//
// That phone call = this endpoint.
//
// Request:  GET /verify-token
//           Header: Authorization: Bearer <token>
//
// Response: { valid: true, user_id: 1, email: "...", role: "customer" }
func VerifyToken(c *gin.Context) {
	// Read the Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "No token provided",
		})
		return
	}

	// Extract the token string from "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Invalid token format",
		})
		return
	}

	tokenStr := parts[1]

	// Parse and verify the token
	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Invalid or expired token",
		})
		return
	}

	// Token is valid — return user info so the calling service knows who this is
	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"user_id": claims.UserID,
		"email":   claims.Email,
		"role":    claims.Role,
	})
}
