package main

import (
	"embed"
	"fmt"
	"os"

	wailsconfigstore "github.com/AndreiTelteu/wails-configstore"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	configStore, err := wailsconfigstore.NewConfigStore("viewparty")
	if err != nil {
		// error too early to display, and not particularly recoverable
		fmt.Printf("Could not initialize the config store: %v\n", err)
		return
	}

	ic, err := os.ReadFile("./build/appicon.png")
	if err != nil {
		println("Failed to read appicon: " + err.Error())
		// probably recoverable
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "Viewparty",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []any{
			app,
			configStore,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyAlways,
			Icon:             ic,
		},
	})

	if err != nil {
		// if we get here, something has already gone quite wrong
		println("Error: ", err.Error())
	}
}
