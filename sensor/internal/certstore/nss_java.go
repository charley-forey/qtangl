//go:build linux

package certstore

import (
	"os"
	"os/exec"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

var nssPaths = []string{
	"/etc/pki/nssdb",
	"/home/.pki/nssdb",
}

var javaCacerts = []string{
	"/etc/ssl/certs/java/cacerts",
	"/usr/lib/jvm/default-java/lib/security/cacerts",
}

func scanNSSAndJava(hostname string) []types.Finding {
	var out []types.Finding
	for _, p := range nssPaths {
		if _, err := os.Stat(p); err == nil {
			out = append(out, types.Finding{
				SchemaVersion: 1,
				FindingID:     "nss-db-" + strings.ReplaceAll(p, "/", "-"),
				FindingType:   "certificate_store",
				HostID:        hostname,
				Hostname:      hostname,
				OS:            "linux",
				Location:      p,
				Algorithm:     "NSS",
				Confidence:    "medium",
				Metadata:      map[string]string{"store": "nss"},
			})
		}
	}
	for _, p := range javaCacerts {
		if _, err := os.Stat(p); err == nil {
			out = append(out, types.Finding{
				SchemaVersion: 1,
				FindingID:     "java-cacerts-" + strings.ReplaceAll(p, "/", "-"),
				FindingType:   "certificate_store",
				HostID:        hostname,
				Hostname:      hostname,
				OS:            "linux",
				Location:      p,
				Algorithm:     "JKS",
				Confidence:    "medium",
				Metadata:      map[string]string{"store": "java_cacerts"},
			})
		}
	}
	if keytool, err := exec.LookPath("keytool"); err == nil {
		_ = keytool
	}
	return out
}
