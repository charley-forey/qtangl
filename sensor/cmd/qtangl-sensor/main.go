package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"runtime"

	"github.com/qtangl/sensor/internal/enroll"
	"github.com/qtangl/sensor/internal/export"
	"github.com/qtangl/sensor/internal/scan"
	"github.com/qtangl/sensor/internal/telemetry"
)

func main() {
	enrollToken := flag.String("enroll", "", "Enrollment token")
	apiURL := flag.String("api", os.Getenv("QTANGL_API_URL"), "Qtangl API base URL")
	hostname, _ := os.Hostname()
	hostFlag := flag.String("hostname", hostname, "Hostname to report")
	output := flag.String("output", "", "Write findings ZIP to path (offline mode)")
	push := flag.Bool("push", false, "Push findings to API after scan")
	agentID := flag.String("agent-id", os.Getenv("QTANGL_AGENT_ID"), "Agent ID after enrollment")
	tenantID := flag.String("tenant-id", os.Getenv("QTANGL_TENANT_ID"), "Tenant ID after enrollment")
	flag.Parse()

	if *enrollToken != "" {
		if *apiURL == "" {
			*apiURL = "http://localhost:8000"
		}
		res, err := enroll.Enroll(*apiURL, *enrollToken, *hostFlag, runtime.GOOS, "0.1.0")
		if err != nil {
			fmt.Fprintf(os.Stderr, "enroll failed: %v\n", err)
			os.Exit(1)
		}
		enc, _ := json.MarshalIndent(res, "", "  ")
		fmt.Println(string(enc))
		return
	}

	findings := scan.RunAll(*hostFlag, runtime.GOOS)
	if *output != "" {
		if err := export.WriteZip(*output, findings); err != nil {
			fmt.Fprintf(os.Stderr, "export failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Wrote %d findings to %s\n", len(findings), *output)
		return
	}

	enc, _ := json.MarshalIndent(map[string]any{"findings": findings, "count": len(findings)}, "", "  ")
	fmt.Println(string(enc))

	if *push && *apiURL != "" && *agentID != "" && *tenantID != "" {
		res, err := telemetry.PushFindings(*apiURL, *tenantID, *agentID, findings)
		if err != nil {
			fmt.Fprintf(os.Stderr, "push failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Pushed: %+v\n", res)
	}
}
