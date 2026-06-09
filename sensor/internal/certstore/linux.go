package certstore

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

var linuxCertDirs = []string{
	"/etc/ssl/certs",
	"/etc/pki/tls/certs",
	"/etc/pki/ca-trust/source/anchors",
}

func scanLinux(hostname string) []types.Finding {
	var findings []types.Finding
	for _, dir := range linuxCertDirs {
		_ = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
			if err != nil || info == nil || info.IsDir() {
				return nil
			}
			if !strings.HasSuffix(strings.ToLower(path), ".pem") && !strings.HasSuffix(strings.ToLower(path), ".crt") {
				return nil
			}
			data, err := os.ReadFile(path)
			if err != nil {
				return nil
			}
			f := pemToFinding(hostname, "linux", path, data)
			if f != nil {
				findings = append(findings, *f)
			}
			return nil
		})
	}
	return findings
}

func pemToFinding(hostname, osName, path string, data []byte) *types.Finding {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil
	}
	if strings.Contains(string(block.Bytes), "PRIVATE KEY") {
		return nil
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil
	}
	ks := cert.PublicKeyAlgorithm.String()
	fp := sha256.Sum256(cert.Raw)
	return &types.Finding{
		SchemaVersion: 1,
		FindingID:     fmt.Sprintf("cert-%s", hex.EncodeToString(fp[:8])),
		FindingType:   "certificate",
		HostID:        hostname,
		Hostname:      hostname,
		OS:            osName,
		Location:      path,
		Algorithm:     ks,
		Fingerprint:   "sha256:" + hex.EncodeToString(fp[:]),
		Confidence:    "high",
	}
}
