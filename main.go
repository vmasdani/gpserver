package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	serverPort := os.Getenv("SERVER_PORT")

	db, err := gorm.Open(sqlite.Open("gpserver.sqlite3"), &gorm.Config{})

	// Get generic database object sql.DB to use its functions
	sqlDB, err := db.DB()

	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(1)

	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(1)

	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&ListedFile{})
	db.AutoMigrate(&Category{})
	db.AutoMigrate(&Tag{})

	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/listed-check", ListedCheckHandler(db))
	r.HandleFunc("/listed-test-insert", ListedTestInsert(db))

	r.HandleFunc("/listedfiles", ListedFiles(db))

	// Bind to a port and pass our router in
	fmt.Println("Listening on http://localhost:" + serverPort)
	log.Fatal(http.ListenAndServe(":"+serverPort, handlers.CompressHandler(cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedHeaders: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},

		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	}).Handler(r))))

}
