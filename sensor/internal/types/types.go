package types

type Finding struct {
	SchemaVersion int               `json:"schemaVersion"`
	FindingID     string            `json:"findingId"`
	FindingType   string            `json:"findingType"`
	HostID        string            `json:"hostId"`
	Hostname      string            `json:"hostname"`
	OS            string            `json:"os"`
	Location      string            `json:"location,omitempty"`
	Algorithm     string            `json:"algorithm,omitempty"`
	KeySize       *int              `json:"keySize,omitempty"`
	Fingerprint   string            `json:"fingerprint,omitempty"`
	LibraryName   string            `json:"libraryName,omitempty"`
	LibraryVersion string           `json:"libraryVersion,omitempty"`
	Port          *int              `json:"port,omitempty"`
	Confidence    string            `json:"confidence"`
	Metadata      map[string]string `json:"metadata,omitempty"`
}
