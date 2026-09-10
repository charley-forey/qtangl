//go:build !linux

package certstore

import "github.com/qtangl/sensor/internal/types"

func scanNSSAndJava(_ string) []types.Finding {
	return nil
}
