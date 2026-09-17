package main

import (
	"log"
	"os"

	"auth-service/config"
	"auth-service/handlers"
	"auth-service/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// main() is the starting point of the entire Auth Service
//
// Think of main() like the "opening checklist" a restaurant does before opening:
//  1. Load the config (read .env — DB password, JWT secret, port)
//  2. Connect to MySQL (open the filing cabinet)
//  3. Set up the routes (put up the signboards — "register here", "login here")
//  4. Start the server (open the doors)
func main() {
	// ── Step 1: Load .env file ──────────────────────────────────────────
	// godotenv reads .env and sets all values as environment variables
	// So os.Getenv("DB_PASSWORD") works anywhere in the app after this
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	// ── Step 2: Connect to MySQL ────────────────────────────────────────
	// This opens the DB connection and auto-creates the users table if needed
	config.ConnectDatabase()

	// ── Step 3: Create the Gin router ──────────────────────────────────
	// Gin is our HTTP framework — it handles incoming requests and routes them
	// Think of Gin as the "receptionist" who directs visitors to the right room
	router := gin.Default()

	// ── Step 4: Health Check ────────────────────────────────────────────
	// A simple endpoint other services (and Kubernetes later) can ping
	// to check if Auth Service is alive and running
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "auth-service",
		})
	})

	// ── Step 5: Public Routes (no token needed) ─────────────────────────
	// Anyone can call these — they're how you GET a token in the first place
	public := router.Group("/api/auth")
	{
		// POST /api/auth/register → create new account
		public.POST("/register", handlers.Register)

		// POST /api/auth/login → get a token
		public.POST("/login", handlers.Login)

		// GET /api/auth/verify-token → called by OTHER services to validate tokens
		public.GET("/verify-token", handlers.VerifyToken)
	}

	// ── Step 6: Protected Routes (token required) ───────────────────────
	// These routes are behind the AuthMiddleware "bouncer"
	// You must send: Authorization: Bearer <your-token>
	protected := router.Group("/api/auth")
	protected.Use(middleware.AuthMiddleware()) // apply bouncer to all routes in this group
	{
		// GET /api/auth/profile → get your own profile
		protected.GET("/profile", handlers.GetProfile)

		// PUT /api/auth/profile → update your name
		protected.PUT("/profile", handlers.UpdateProfile)
	}

	// ── Step 7: Start the Server ────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001" // default port for auth service
	}

	log.Printf("🚀 Auth Service running on port %s", port)
	log.Printf("📋 Routes:")
	log.Printf("   POST   /api/auth/register")
	log.Printf("   POST   /api/auth/login")
	log.Printf("   GET    /api/auth/verify-token")
	log.Printf("   GET    /api/auth/profile     [protected]")
	log.Printf("   PUT    /api/auth/profile     [protected]")
	log.Printf("   GET    /health")

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
