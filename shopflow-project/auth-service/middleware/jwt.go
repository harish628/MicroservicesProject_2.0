package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Claims is the "payload" inside the JWT token
// Think of JWT like a sealed envelope:
//   - Outside: everyone can see who it's from
//   - Inside: the claims (user info) — only readable if you have the secret key
type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken creates a JWT token for a given user
// This is like giving someone a stamped ID card after they've proven who they are
//
// How JWT works (Feynman version):
//  1. We take the user's info (ID, email, role)
//  2. We mix it with our SECRET KEY (like a stamp only we have)
//  3. The result is a long string (the token) — e.g. "eyJhbGci..."
//  4. We give this token to the user
//  5. Next time they make a request, they show this token
//  6. We verify the stamp is ours → we trust it → we know who they are
//     WITHOUT hitting the database again!
func GenerateToken(userID uint, email, role string) (string, error) {
	expiryHours := 24 // token valid for 24 hours

	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Sign the token with our secret key using HS256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// AuthMiddleware is a "bouncer" for protected routes
// Before letting a request through, it checks:
//   1. Does the request have a token?
//   2. Is the token valid (not expired, not tampered)?
//   3. If yes → let them in and attach their info to the request context
//   4. If no → reject with 401 Unauthorized
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Token comes in the "Authorization" header as: "Bearer <token>"
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort() // stop processing this request
			return
		}

		// Split "Bearer eyJhbGci..." → ["Bearer", "eyJhbGci..."]
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format. Use: Bearer <token>"})
			c.Abort()
			return
		}

		tokenStr := parts[1]

		// Parse and verify the token using our secret key
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Token is valid! Attach user info to the request context
		// Downstream handlers can read this with: c.GetUint("userID")
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next() // proceed to the actual handler
	}
}

// AdminOnly middleware — only allows users with role = "admin"
// Used to protect admin-only routes
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}
