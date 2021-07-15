package main

type ListedFileView struct {
	Path          string      `json:"path"`
	Size          int64       `json:"size"`
	ListedFile    *ListedFile `json:"listedFile"`
	Category      *Category   `json:"category"`
	Tags          []Tag       `json:"tags"`
	PreviewBase64 *string     `json:"previewBase64"`
}
