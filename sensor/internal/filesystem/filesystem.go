package filesystem

import (
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

var extensions = map[string]bool{".pem": true, ".crt": true, ".cer": true}

func Scan(hostname, osName string) []types.Finding {
	var findings []types.Finding
	roots := []string{"/etc/ssl", "/etc/pki"}
	if osName == "darwin" {
		roots = []string{"/etc/ssl"}
	}
	for _, root := range roots {
		_ = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
			if err != nil || info == nil || info.IsDir() {
				return nil
			}
			ext := strings.ToLower(filepath.Ext(path))
			if !extensions[ext] {
				return nil
			}
			data, err := os.ReadFile(path)
			if err != nil {
				return nil
			}
			if strings.Contains(string(data), "PRIVATE KEY") {
				return nil
			}
			block, _ := pem.Decode(data)
			if block == nil {
				return nil
			}
			cert, err := x509.ParseCertificate(block.Bytes)
			if err != nil {
				return nil
			}
			fp := sha256.Sum256(cert.Raw)
			findings = append(findings, types.Finding{
				SchemaVersion: 1,
				FindingID:     fmt.Sprintf("fs-%s", hex.EncodeToString(fp[:8])),
				FindingType:   "certificate",
				HostID:        hostname,
				Hostname:      hostname,
				OS:            osName,
				Location:      path,
				Algorithm:     cert.PublicKeyAlgorithm.String(),
				Fingerprint:   "sha256:" + hex.EncodeToString(fp[:]),
				Confidence:    "medium",
			})
			return nil
		})
	}
	return findings
}
