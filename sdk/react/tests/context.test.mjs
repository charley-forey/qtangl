import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { QtanglProvider, useQtanglClient } from "../dist/index.js";

function Probe() {
  const client = useQtanglClient();
  return createElement("span", null, typeof client.monitor.listWebhooks);
}

test("QtanglProvider exposes client to useQtanglClient", () => {
  const html = renderToStaticMarkup(
    createElement(
      QtanglProvider,
      { baseUrl: "https://api.example.com", apiKey: "demo-key" },
      createElement(Probe)
    )
  );
  assert.match(html, /function/);
});

test("useQtanglClient throws without provider", () => {
  assert.throws(() => renderToStaticMarkup(createElement(Probe)), /QtanglProvider/);
});
