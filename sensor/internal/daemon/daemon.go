package daemon

import (
	"os"
	"time"

	"github.com/qtangl/sensor/internal/scan"
	"github.com/qtangl/sensor/internal/telemetry"
)

type Config struct {
	APIURL        string
	TenantID      string
	AgentID       string
	Hostname      string
	OS            string
	HeartbeatMins int
	ScanHours     int
	AgentCertPEM  string
}

func Run(cfg Config) {
	heartbeat := time.Duration(cfg.HeartbeatMins) * time.Minute
	if heartbeat <= 0 {
		heartbeat = 5 * time.Minute
	}
	scanEvery := time.Duration(cfg.ScanHours) * time.Hour
	if scanEvery <= 0 {
		scanEvery = 24 * time.Hour
	}
	ticker := time.NewTicker(heartbeat)
	scanTicker := time.NewTicker(scanEvery)
	defer ticker.Stop()
	defer scanTicker.Stop()

	push := func() {
		findings := scan.RunAll(cfg.Hostname, cfg.OS)
		_, err := telemetry.PushFindingsWithCert(cfg.APIURL, cfg.TenantID, cfg.AgentID, findings, cfg.AgentCertPEM)
		if err != nil {
			_, _ = os.Stderr.WriteString("push failed: " + err.Error() + "\n")
		}
	}

	push()
	for {
		select {
		case <-ticker.C:
			_, _ = telemetry.HeartbeatWithCert(cfg.APIURL, cfg.TenantID, cfg.AgentID, cfg.AgentCertPEM)
		case <-scanTicker.C:
			push()
		}
	}
}
