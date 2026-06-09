package certstore

import (
	"os/exec"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

func scanDarwin(hostname string) []types.Finding {
	cmd := exec.Command("security", "find-certificate", "-a", "-p", "/Library/Keychains/System.keychain")
	out, err := cmd.Output()
	if err != nil {
		return nil
	}
	var findings []types.Finding
	blocks := strings.Split(string(out), "-----END CERTIFICATE-----")
	for i, block := range blocks {
		if !strings.Contains(block, "BEGIN CERTIFICATE") {
			continue
		}
		data := []byte(block + "-----END CERTIFICATE-----")
		f := pemToFinding(hostname, "darwin", "/Library/Keychains/System.keychain", data)
		if f != nil {
			f.FindingID = f.FindingID + "-" + string(rune('a'+i%26))
			findings = append(findings, *f)
		}
	}
	return findings
}
