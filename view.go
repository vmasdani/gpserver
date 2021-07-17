package main

type ListedFileView struct {
	Path                string              `json:"path"`
	Size                int64               `json:"size"`
	ListedFile          *ListedFile         `json:"listedFile"`
	Category            *Category           `json:"category"`
	ListedFileTags      []ListedFileTagView `json:"listedFileTags"`
	PreviewBase64       *string             `json:"previewBase64"`
	ListedFileDeleteIds []uint              `json:"listedFileDeleteIds"`
	CategoryDeleteIds   []uint              `json:"categoryDeleteIds"`
	TagDeleteIds        []uint              `json:"tagDeleteIds"`
}

type ListedFileTagView struct {
	ListedFileTag ListedFileTag `json:"listedFileTag"`
}
