//go:build windows

package dotnet

import (
	"os/exec"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

func Scan(hostname string) []types.Finding {
	cmd := exec.Command("powershell", "-NoProfile", "-Command",
		`Get-ChildItem Cert:\LocalMachine\My | ForEach-Object { $_.Thumbprint + '|' + $_.Subject }`)
	out, err := cmd.Output()
	if err != nil {
		return nil
	}
	var findings []types.Finding
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, "|", 2)
		findings = append(findings, types.Finding{
			SchemaVersion: 1,
			FindingID:     "dotnet-cert-" + parts[0][:min(12, len(parts[0]))],
			FindingType:   "certificate",
			HostID:        hostname,
			Hostname:      hostname,
			OS:            "windows",
			Location:      "Cert:\\LocalMachine\\My",
			Algorithm:     "dotnet-store",
			Confidence:    "high",
			Metadata:      map[string]string{"subject": parts[1]},
		})
	}
	return findings
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
