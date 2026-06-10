package telemetry

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"time"

	"github.com/qtangl/sensor/internal/types"
)

const maxRetries = 4

func PushFindings(apiURL, tenantID, agentID string, findings []types.Finding) (map[string]any, error) {
	body, _ := json.Marshal(map[string]any{
		"tenantId": tenantID,
		"agentId":  agentID,
		"findings": findings,
	})
	url := trim(apiURL) + "/discovery/agent/findings"
	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			jitter := time.Duration(500+rand.Intn(1500)) * time.Millisecond
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			time.Sleep(backoff + jitter)
		}
		req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Qtangl-Discovery-Schema", "1")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		code := resp.StatusCode
		raw, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		if code == 429 || code >= 500 {
			if ra := resp.Header.Get("Retry-After"); ra != "" {
				if sec, err := time.ParseDuration(ra + "s"); err == nil {
					time.Sleep(sec)
				}
			}
			lastErr = fmt.Errorf("push HTTP %d", code)
			continue
		}
		if code >= 400 {
			return nil, fmt.Errorf("push HTTP %d", code)
		}
		var out map[string]any
		_ = json.Unmarshal(raw, &out)
		return out, nil
	}
	return nil, lastErr
}

func PushFindingsWithCert(apiURL, tenantID, agentID string, findings []types.Finding, certPEM string) (map[string]any, error) {
	return postWithCert(apiURL, tenantID, agentID, "/discovery/agent/findings", map[string]any{
		"tenantId": tenantID,
		"agentId":  agentID,
		"findings": findings,
	}, certPEM)
}

func HeartbeatWithCert(apiURL, tenantID, agentID, certPEM string) (map[string]any, error) {
	return postWithCert(apiURL, tenantID, agentID, "/discovery/agent/heartbeat", map[string]any{
		"tenantId": tenantID,
		"agentId":  agentID,
	}, certPEM)
}

func postWithCert(apiURL, tenantID, agentID, path string, body map[string]any, certPEM string) (map[string]any, error) {
	raw, _ := json.Marshal(body)
	url := trim(apiURL) + path
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if certPEM != "" {
		req.Header.Set("X-Qtangl-Agent-Cert", certPEM)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("%s HTTP %d", path, resp.StatusCode)
	}
	var out map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return out, nil
}

func trim(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}
