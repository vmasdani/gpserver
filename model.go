package main

import (
	"time"

	"gorm.io/gorm"
)

type GormModel struct {
	ID        uint `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type ListedFile struct {
	GormModel
	Name       string `json:"name"`
	CategoryID uint   `json:"categoryId"`
}

type Category struct {
	GormModel
	Name string `json:"name"`
}

type Tag struct {
	GormModel
	Name string `json:"name"`
}
