package export

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

type Manifest struct {
	Version           string `json:"version"`
	FindingCount      int    `json:"findingCount"`
	ManifestSignature string `json:"manifestSignature"`
}

func WriteZip(path string, findings []types.Finding) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	w := zip.NewWriter(f)
	defer w.Close()
	findingsEntry, err := w.Create("findings.json")
	if err != nil {
		return err
	}
	payload, err := json.Marshal(findings)
	if err != nil {
		return err
	}
	if _, err := findingsEntry.Write(payload); err != nil {
		return err
	}
	sum := sha256.Sum256(payload)
	manifest := Manifest{
		Version:           "1",
		FindingCount:      len(findings),
		ManifestSignature: "sha256:" + hex.EncodeToString(sum[:]),
	}
	manifestEntry, err := w.Create("manifest.json")
	if err != nil {
		return err
	}
	return json.NewEncoder(manifestEntry).Encode(manifest)
}

func ValidateManifestSignature(sig string) error {
	if !strings.HasPrefix(sig, "sha256:") || len(sig) < 71 {
		return fmt.Errorf("invalid manifest signature")
	}
	return nil
}
