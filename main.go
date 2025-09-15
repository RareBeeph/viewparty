package main

import (
	"embed"
	"fmt"

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
		fmt.Printf("could not initialize the config store: %v\n", err)
		return
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "myproject",
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
    },
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
