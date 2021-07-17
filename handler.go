package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
	"sync"

	"gorm.io/gorm"
)

// Command to generate thumb
// ffmpeg -i sample-mp4-file.mp4 -ss 00:00:01.000 -vframes 1 -filter:v scale=150:-1 output_thmb.png -y

func ListedCheckHandler(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		homeDir := os.Getenv("HOME_DIR")

		files, err := ioutil.ReadDir(homeDir)
		if err != nil {
			log.Fatal(err)
		}

		listedFileMapped := []ListedFileView{}

		var wg sync.WaitGroup
		var mut sync.Mutex

		var categories []Category
		db.Find(&categories)

		for _, f := range files {
			wg.Add(1)

			go func(f fs.FileInfo) {
				defer wg.Done()

				fName := f.Name()
				fSize := f.Size()

				mut.Lock()
				defer mut.Unlock()

				var listedFile ListedFile
				db.Where("name = ?", fName).First(&listedFile)

				var listedFileTags []ListedFileTag
				db.Where("listed_file_id = ?", listedFile.ID).Find(&listedFileTags)

				listedFileView := ListedFileToListedFileView(listedFile, ListedFileConfigView{
					WithThumbnail:  false,
					FileName:       fName,
					FileSize:       fSize,
					Categories:     categories,
					ListedFileTags: listedFileTags,
				})

				listedFileMapped = append(listedFileMapped, listedFileView)
			}(f)
		}

		wg.Wait()

		sort.Slice(listedFileMapped, func(i int, j int) bool {
			return strings.Compare(strings.ToLower(listedFileMapped[i].Path), strings.ToLower(listedFileMapped[j].Path)) == -1
		})

		json.NewEncoder(w).Encode(&listedFileMapped)
	}
}

type ListedFileConfigView struct {
	WithThumbnail  bool
	FileName       string
	FileSize       int64
	Categories     []Category
	ListedFileTags []ListedFileTag
}

func ListedFileToListedFileView(listedFile ListedFile, config ListedFileConfigView) ListedFileView {
	s := "===="

	var category *Category

	for _, cat := range config.Categories {
		if cat.ID == listedFile.CategoryID {
			category = &cat
			break
		}
	}

	homeDir := os.Getenv("HOME_DIR")
	path := ""

	if config.WithThumbnail {
		// Check if pic or video
		if strings.Contains(listedFile.Name, ".mp4") ||
			strings.Contains(listedFile.Name, ".mkv") ||
			strings.Contains(listedFile.Name, ".webm") ||
			strings.Contains(listedFile.Name, ".3gp") ||
			strings.Contains(listedFile.Name, ".gif ") {
			path = "./thumb/" + strconv.Itoa(int(listedFile.ID)) + ".png"
		} else if strings.Contains(listedFile.Name, ".png") ||
			strings.Contains(listedFile.Name, ".jpeg") ||

			strings.Contains(listedFile.Name, ".jpg") {
			path = homeDir + listedFile.Name
		}

		f, err := ioutil.ReadFile(path)

		if err != nil {
			fmt.Println("[WithThumbnail error]", path, "does not exist")
		} else {
			s = base64.StdEncoding.EncodeToString(f)
		}
	}

	listedFileView := ListedFileView{
		Path:     config.FileName,
		Size:     config.FileSize,
		Category: category,
		ListedFileTags: func() []ListedFileTagView {
			listedFileTagViews := []ListedFileTagView{}

			for _, listedFileTag := range config.ListedFileTags {
				listedFileTagViews = append(
					listedFileTagViews,
					ListedFileTagView{ListedFileTag: listedFileTag},
				)
			}

			return listedFileTagViews
		}(),
		PreviewBase64: &s,
	}

	if listedFile.ID != 0 {
		listedFileView.ListedFile = &listedFile
	}

	return listedFileView
}

func RefreshThumbnail(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {

		RefreshThumbnailFunc(db)
	}
}

func RefreshThumbnailFunc(db *gorm.DB) {
	var listedFiles []ListedFile
	db.Debug().Where("name like '%.mp4' or name like '%.mov' or name like '%.mkv' or name like '%.3gp' or '%.webm' or name like '%.gif'").Find(&listedFiles)

	mediaDir := os.Getenv("HOME_DIR")

	for _, listedFile := range listedFiles {
		if listedFile.ID != 0 {
			cmd := exec.Command("/bin/sh", "-c", "ffmpeg -i '"+mediaDir+listedFile.Name+"' -ss 00:00:01.000 -vframes 1 -filter:v scale=150:-1 'thumb/"+strconv.Itoa(int(listedFile.ID))+".png' -y")

			fmt.Println(cmd)
			err := cmd.Run()

			if err != nil {
				fmt.Println(err)
			}
		}
	}
}

func ListedFiles(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var listedFiles []ListedFile
		db.Find(&listedFiles)

		json.NewEncoder(w).Encode(&listedFiles)
	}
}

func Paginate(page int, pageSize int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page == 0 {
			page = 1
		}

		switch {
		case pageSize > 100:
			pageSize = 100
		case pageSize <= 0:
			pageSize = 10
		}

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

type PagedInfo struct {
	Last    int              `json:"last"`
	Page    int              `json:"page"`
	Size    int              `json:"size"`
	Content []ListedFileView `json:"content"`
}

func ListedFilesPaged(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		page := 1
		mediaType := "video"

		pageSize := 100

		pageQuery := r.URL.Query().Get("page")
		mediaTypeQuery := r.URL.Query().Get("type")

		pageQueryInt, err := strconv.Atoi(pageQuery)

		if err != nil {
			fmt.Println("ERror converting pageQuery")
		} else {
			page = pageQueryInt
		}

		if mediaTypeQuery != "" {
			mediaType = mediaTypeQuery
		}

		w.Header().Set("content-type", "application/json")

		var categories []Category
		db.Find(&categories)

		chain := db.Where("")

		// Differentiate type video and image
		if mediaType == "video" {
			chain.Where("name like '%.mp4' or name like '%.mov' or name like '%.mkv' or name like '%.3gp' or '%.webm' or name like '%.gif'")
		} else if mediaType == "image" {
			chain.Where("name like '%.jpg' or name like '%.jpeg' or name like '%.png'")
		}

		var listedFiles []ListedFile
		chain = chain.Order("id desc")

		chain.Debug().Scopes(Paginate(page, pageSize)).Find(&listedFiles)

		fmt.Println("\n[COUNT] start")

		var count int64
		chain.Debug().Model(&listedFiles).Count(&count)

		fmt.Println("[COUNT]", count)

		listedFilesView := []ListedFileView{}

		for _, listedFile := range listedFiles {
			listedFilesView = append(listedFilesView, ListedFileToListedFileView(listedFile, ListedFileConfigView{
				WithThumbnail:  true,
				FileName:       listedFile.Name,
				FileSize:       0,
				Categories:     categories,
				ListedFileTags: []ListedFileTag{},
			}))
		}

		pagedInfo := PagedInfo{
			Last:    int(math.Round(float64(count)/float64(pageSize))) + 1,
			Page:    page,
			Size:    pageSize,
			Content: listedFilesView,
		}

		json.NewEncoder(w).Encode(pagedInfo)
	}
}

func SaveListedFiles(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var listedFileViews []ListedFileView
		json.NewDecoder(r.Body).Decode(&listedFileViews)

		var wg sync.WaitGroup

		for _, listedFileView := range listedFileViews {
			wg.Add(1)

			go func(listedFileView ListedFileView) {
				defer wg.Done()

				if listedFileView.ListedFile != nil {
					fmt.Println("[SAVED]", listedFileView.ListedFile.Name)

					// Save listed file
					db.Save(listedFileView.ListedFile)
				}

			}(listedFileView)
		}

		wg.Wait()

		w.WriteHeader(http.StatusCreated)
	}
}

func ListedTestInsert(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		db.Save(&ListedFile{Name: "sample-mp4-file.mp4"})
	}
}

func Categories(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var categories []Category
		db.Find(&categories)

		json.NewEncoder(w).Encode(&categories)
	}
}

func CategoriesSaveBatch(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var categories []Category
		json.NewDecoder(r.Body).Decode(&categories)

		var wg sync.WaitGroup

		for _, category := range categories {
			wg.Add(1)

			go func(category Category) {
				defer wg.Done()

				db.Save(&category)
			}(category)

		}

		wg.Wait()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(&categories)
	}
}

func Tags(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var tags []Tag
		db.Find(&tags)

		json.NewEncoder(w).Encode(&tags)
	}
}

func TagsSaveBatch(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var tags []Tag
		json.NewDecoder(r.Body).Decode(&tags)

		var wg sync.WaitGroup

		for _, tag := range tags {
			wg.Add(1)

			go func(tag Tag) {
				defer wg.Done()

				db.Save(&tag)
			}(tag)

		}

		wg.Wait()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(&tags)
	}
}
