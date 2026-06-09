package scan

import (
	"runtime"

	"github.com/qtangl/sensor/internal/certstore"
	"github.com/qtangl/sensor/internal/dotnet"
	"github.com/qtangl/sensor/internal/filesystem"
	"github.com/qtangl/sensor/internal/libraries"
	"github.com/qtangl/sensor/internal/listeners"
	"github.com/qtangl/sensor/internal/types"
)

func RunAll(hostname, osName string) []types.Finding {
	var out []types.Finding
	out = append(out, certstore.Scan(hostname, osName)...)
	out = append(out, filesystem.Scan(hostname, osName)...)
	out = append(out, libraries.Scan(hostname, osName)...)
	out = append(out, dotnet.Scan(hostname)...)
	if osName == "linux" || osName == runtime.GOOS {
		out = append(out, listeners.Scan(hostname)...)
	}
	return out
}
