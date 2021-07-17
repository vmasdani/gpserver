package main

import (
	"time"

	"gorm.io/gorm"
)

type GormModel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt"`
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
	// ListedFileID uint   `json:"listedFileId"`
}

type ListedFileTag struct {
	GormModel
	TagID        uint `json:"tagId"`
	ListedFileID uint `json:"listedFileId"`
}
