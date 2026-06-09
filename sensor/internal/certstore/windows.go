package certstore

import (
	"os/exec"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

func scanWindows(hostname string) []types.Finding {
	cmd := exec.Command("powershell", "-NoProfile", "-Command",
		`Get-ChildItem Cert:\LocalMachine\My | ForEach-Object { $_.Thumbprint + '|' + $_.Subject + '|' + $_.NotAfter }`)
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
		parts := strings.SplitN(line, "|", 3)
		thumb := parts[0]
		subject := ""
		if len(parts) > 1 {
			subject = parts[1]
		}
		findings = append(findings, types.Finding{
			SchemaVersion: 1,
			FindingID:     "win-cert-" + thumb[:min(16, len(thumb))],
			FindingType:   "certificate",
			HostID:        hostname,
			Hostname:      hostname,
			OS:            "windows",
			Location:      "Cert:\\LocalMachine\\My\\" + thumb,
			Algorithm:     subject,
			Fingerprint:   "sha256:" + thumb,
			Confidence:    "high",
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
