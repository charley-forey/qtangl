package certstore

import (
	"runtime"

	"github.com/qtangl/sensor/internal/types"
)

func Scan(hostname, osName string) []types.Finding {
	switch osName {
	case "linux":
		return scanLinux(hostname)
	case "windows":
		return scanWindows(hostname)
	case "darwin":
		return scanDarwin(hostname)
	default:
		if runtime.GOOS == "linux" {
			return scanLinux(hostname)
		}
		return nil
	}
}
