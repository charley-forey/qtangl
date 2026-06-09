//go:build !windows

package dotnet

import "github.com/qtangl/sensor/internal/types"

func Scan(_ string) []types.Finding {
	return nil
}
