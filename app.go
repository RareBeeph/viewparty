package main

import (
	"context"
	"os"
	"path/filepath"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetVideos() []string {
	dir, err := os.ReadDir("./videos")

	if err != nil {
		println(err.Error())
		return []string{}
	}

	videos := []string{}
	for _, entry := range dir {
		if entry.Name()[0] == '.' {
			continue
		}

		videos = append(videos, entry.Name())
	}

	return videos
}

func (a *App) GetBasePath() string {
	abs, err := filepath.Abs(".")

	if err != nil {
		println(err.Error())
		return ""
	}

	return abs + "/videos/"
}
