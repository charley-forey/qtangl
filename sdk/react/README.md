# @qtangl/sdk-react

React context and hooks for the Qtangl API client.

## Install

```bash
npm install @qtangl/sdk @qtangl/sdk-react react
```

## Usage

```tsx
import { QtanglProvider, useQtanglClient } from "@qtangl/sdk-react";

function Dashboard({ apiKey }: { apiKey: string }) {
  return (
    <QtanglProvider baseUrl="https://api.qtangl.com" apiKey={apiKey}>
      <Schedules />
    </QtanglProvider>
  );
}

function Schedules() {
  const client = useQtanglClient();
  // client.monitor.listWebhooks(), client.drift.summary(), etc.
}
```
