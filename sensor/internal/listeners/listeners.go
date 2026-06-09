package listeners

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/qtangl/sensor/internal/types"
)

var portRe = regexp.MustCompile(`:(\d+)\s`)

func Scan(hostname string) []types.Finding {
	cmd := exec.Command("ss", "-lntp")
	out, err := cmd.Output()
	if err != nil {
		return nil
	}
	var findings []types.Finding
	for _, line := range strings.Split(string(out), "\n") {
		if !strings.Contains(line, "LISTEN") {
			continue
		}
		m := portRe.FindStringSubmatch(line)
		if len(m) < 2 {
			continue
		}
		port, _ := strconv.Atoi(m[1])
		if port != 443 && port != 8443 && port != 4433 {
			continue
		}
		findings = append(findings, types.Finding{
			SchemaVersion: 1,
			FindingID:     "listener-" + m[1],
			FindingType:   "listener",
			HostID:        hostname,
			Hostname:      hostname,
			OS:            "linux",
			Location:      line,
			Port:          &port,
			Algorithm:     "TLS",
			Confidence:    "medium",
		})
	}
	return findings
}
