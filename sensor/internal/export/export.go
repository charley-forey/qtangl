package export

import (
	"archive/zip"
	"encoding/json"
	"os"

	"github.com/qtangl/sensor/internal/types"
)

func WriteZip(path string, findings []types.Finding) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	w := zip.NewWriter(f)
	defer w.Close()
	entry, err := w.Create("findings.json")
	if err != nil {
		return err
	}
	enc := json.NewEncoder(entry)
	enc.SetIndent("", "  ")
	return enc.Encode(findings)
}
