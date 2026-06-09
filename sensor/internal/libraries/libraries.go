package libraries

import (
	"os/exec"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

func Scan(hostname, osName string) []types.Finding {
	var findings []types.Finding
	if out, err := exec.Command("openssl", "version").Output(); err == nil {
		parts := strings.Fields(string(out))
		ver := ""
		if len(parts) >= 2 {
			ver = parts[1]
		}
		findings = append(findings, types.Finding{
			SchemaVersion:  1,
			FindingID:      "lib-openssl",
			FindingType:    "library",
			HostID:         hostname,
			Hostname:       hostname,
			OS:             osName,
			Location:       "openssl",
			Algorithm:      "OpenSSL",
			LibraryName:    "openssl",
			LibraryVersion: ver,
			Confidence:     "high",
		})
	}
	return findings
}
