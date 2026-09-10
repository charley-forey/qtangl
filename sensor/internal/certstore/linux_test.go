//go:build linux

package certstore

import (
	"os"
	"path/filepath"
	"testing"
)

func TestPemToFindingRejectsPrivateKey(t *testing.T) {
	pem := []byte(`-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC
-----END PRIVATE KEY-----`)
	if f := pemToFinding("host", "linux", "/tmp/key.pem", pem); f != nil {
		t.Fatal("expected nil for private key")
	}
}

func TestScanLinuxEmptyDir(t *testing.T) {
	dir := t.TempDir()
	oldDirs, oldNSS, oldJava := linuxCertDirs, nssPaths, javaCacerts
	linuxCertDirs = []string{dir}
	nssPaths, javaCacerts = nil, nil
	defer func() { linuxCertDirs, nssPaths, javaCacerts = oldDirs, oldNSS, oldJava }()
	_ = os.WriteFile(filepath.Join(dir, "test.crt"), []byte("not a cert"), 0644)
	findings := scanLinux("testhost")
	if len(findings) != 0 {
		t.Fatalf("expected 0 findings, got %d", len(findings))
	}
}
