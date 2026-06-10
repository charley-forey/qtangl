package enroll

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Result struct {
	AgentID      string `json:"agentId"`
	TenantID     string `json:"tenantId"`
	FleetID      string `json:"fleetId"`
	CertPEM      string `json:"certPem"`
	KeyPEM       string `json:"keyPem"`
	CAChainPEM   string `json:"caChainPem"`
	Serial       string `json:"serial"`
	Fingerprint  string `json:"fingerprint"`
	ExpiresAt    string `json:"expiresAt"`
}

func Enroll(apiURL, token, hostname, osName, version string) (*Result, error) {
	body, _ := json.Marshal(map[string]string{
		"enrollmentToken": token,
		"hostname":        hostname,
		"os":              osName,
		"sensorVersion":   version,
	})
	req, err := http.NewRequest(http.MethodPost, stringsTrim(apiURL)+"/discovery/agent/enroll", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("enroll HTTP %d", resp.StatusCode)
	}
	var wrapper struct {
		Status string `json:"status"`
		Result
	}
	if err := json.NewDecoder(resp.Body).Decode(&wrapper); err != nil {
		return nil, err
	}
	return &wrapper.Result, nil
}

func stringsTrim(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}
