package main

import (
	"encoding/json"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"

	"gorm.io/gorm"
)

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

		for _, f := range files {
			wg.Add(1)

			go func(f fs.FileInfo) {
				defer wg.Done()

				fName := f.Name()
				fSize := f.Size()

				mut.Lock()
				defer mut.Unlock()

				var listedFile ListedFile
				if db.Where("name = ?", fName).First(&listedFile).Error == nil {

				}

				listedFileView := ListedFileView{
					Path: fName,
					Size: fSize,
					Tags: []Tag{},
				}

				if listedFile.ID != 0 {
					listedFileView.ListedFile = &listedFile
				}

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

func ListedFiles(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		var listedFiles []ListedFile
		db.Find(&listedFiles)

		json.NewEncoder(w).Encode(&listedFiles)
	}
}

func ListedTestInsert(db *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "application/json")

		db.Save(&ListedFile{Name: "1.mp4"})
	}
}
