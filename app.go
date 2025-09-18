package main

import (
	"context"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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

func (a *App) GetVideos(srcDir string) ([]string, error) {
	dir, err := os.ReadDir(srcDir)

	// if err != nil, this should still run without a hitch
	// (am i assuming too much about dir?)
	// (am i trying to be too clever?)
	videos := []string{}
	for _, entry := range dir {
		if entry.Name()[0] == '.' {
			continue
		}

		videos = append(videos, entry.Name())
	}

	// propagate whether or not we errored up to js
	return videos, err
}

func (a *App) GetBasePath(srcDir string) (string, error) {
	abs, err := filepath.Abs(srcDir)

	// could probably also collapse into the return
	if err != nil {
		return "", err
	}

	return abs + "/", nil
}

func (a *App) DirDialog() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Folder",
	})
}
