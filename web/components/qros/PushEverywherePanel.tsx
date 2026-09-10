"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { configurePushBriefing, fetchPushBriefing, sendPushBriefingNow, type BriefingChannel, type BriefingConfiguration } from "@/lib/qros-api";

const CHANNELS: BriefingChannel[] = ["email", "slack", "teams", "webhook"];
const fieldClass = "mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-transparent p-2 text-sm text-white";

export default function PushEverywherePanel() {
  const [config, setConfig] = useState<BriefingConfiguration | null>(null);
  const [savedEnabled, setSavedEnabled] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await fetchPushBriefing();
      setConfig(result);
      setSavedEnabled(result.enabled);
      setRecipients(result.recipients.join(", "));
    } catch {
      setError("Could not load briefing preferences. Retry to continue.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const edit = (change: Partial<BriefingConfiguration>) => {
    setConfig((current) => current ? { ...current, ...change } : current);
    setNotice(null);
    setError(null);
  };

  const submit = async (sendNow: boolean) => {
    if (!config) return;
    const preferences = {
      channels: config.channels,
      recipients: recipients.split(",").map((value) => value.trim()).filter(Boolean),
      cadenceHours: config.cadenceHours,
      enabled: config.enabled,
    };
    setNotice(null);
    setError(null);
    if (!preferences.channels.length || (preferences.channels.includes("email") && !preferences.recipients.length)) {
      setError("Select a delivery channel and provide recipients when email is selected.");
      return;
    }
    if (preferences.recipients.some((value) => /[^\x00-\x7F]/.test(value))) {
      setError("Use ASCII email addresses for briefing recipients.");
      return;
    }
    setBusy(true);
    try {
      if (sendNow) {
        const result = await sendPushBriefingNow(preferences);
        const { delivered, attempted, errors } = result.delivery;
        const outcome = `${delivered} of ${attempted} destinations delivered.`;
        if (result.status === "success" && delivered > 0) {
          setNotice(outcome);
        } else {
          setError(`${delivered > 0 ? "Partial delivery." : "Briefing was not delivered."} ${outcome} ${errors.join(" ")}`.trim());
        }
      } else {
        const result = await configurePushBriefing(preferences);
        setConfig({ ...result, lastDelivery: result.firstRunAt === config.firstRunAt ? config.lastDelivery : null });
        setSavedEnabled(result.enabled);
        setNotice(result.enabled ? "Preferences saved. Scheduled delivery is enabled." : "Preferences saved. Scheduled delivery is off.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Briefing request failed. Please retry.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Push everywhere</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">Deliver briefings to email recipients or configured integrations. Sending now does not save preferences.</p>
      {!config && busy ? <p role="status" className="mt-3 text-sm">Loading briefing preferences…</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-amber-200">{error}</p> : null}
      {!config && !busy ? <Button type="button" onClick={() => void load()}>Retry loading preferences</Button> : null}
      {config ? (
        <form onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          void submit(submitter?.getAttribute("value") === "send");
        }}>
          <fieldset disabled={busy} className="mt-3 space-y-3">
            <legend className="sr-only">Briefing delivery preferences</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Delivery channels">
              {CHANNELS.map((channel) => (
                <button key={channel} type="button" aria-pressed={config.channels.includes(channel)} onClick={() => edit({ channels: config.channels.includes(channel) ? config.channels.filter((value) => value !== channel) : [...config.channels, channel] })}
                  className={`rounded-full px-3 py-1 text-xs capitalize ${config.channels.includes(channel) ? "bg-white text-black" : "border border-[var(--border-subtle)] text-[var(--color-gray-300)]"}`}>
                  {channel}
                </button>
              ))}
            </div>
            <label className="block text-xs text-[var(--color-gray-300)]">Email recipients
              <input type="email" multiple value={recipients} required={config.channels.includes("email")} onChange={(event) => { setRecipients(event.target.value); edit({}); }} aria-describedby="briefing-recipients-help" className={fieldClass} />
            </label>
            <p id="briefing-recipients-help" className="text-xs text-[var(--color-gray-400)]">Separate email addresses with commas.</p>
            <label className="block text-xs text-[var(--color-gray-300)]">Delivery interval (hours)
              <input type="number" min={1} max={168} step={1} required value={Number.isNaN(config.cadenceHours) ? "" : config.cadenceHours} onChange={(event) => edit({ cadenceHours: event.target.valueAsNumber })} className={fieldClass} />
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.enabled} onChange={(event) => edit({ enabled: event.target.checked })} />Enable scheduled delivery</label>
            <p className="text-xs text-[var(--color-gray-400)]">Configure subscriptions in Settings → Integrations: briefing.slack for Slack, briefing.teams for Teams, and briefing.webhook for generic webhooks.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" value="save" variant="secondary">Save preferences</Button>
              <Button type="submit" value="send">Send briefing now</Button>
            </div>
          </fieldset>
          {config.requiresSave ? <p className="mt-2 text-xs text-amber-200">Previous preferences need to be saved again before scheduled delivery can start.</p> : null}
          {config.firstRunAt ? <p className="mt-2 text-xs text-[var(--color-gray-300)]">First scheduled time: {new Date(config.firstRunAt).toLocaleString()}. {savedEnabled ? "" : "Scheduled delivery is off."}</p> : null}
          {config.lastDelivery ? <p className="mt-2 text-xs text-[var(--color-gray-300)]">Last scheduled outcome: {config.lastDelivery.outcomeUnknown ? "unknown; delivery could not be confirmed" : `${config.lastDelivery.status} — ${config.lastDelivery.delivered ?? "unknown"} of ${config.lastDelivery.attempted ?? "unknown"} destinations delivered`}. Attempted {new Date(config.lastDelivery.attemptedAt).toLocaleString()}.</p> : <p className="mt-2 text-xs text-[var(--color-gray-400)]">No scheduled delivery outcome recorded.</p>}
        </form>
      ) : null}
      {notice ? <p role="status" className="mt-2 text-xs text-emerald-300">{notice}</p> : null}
    </Card>
  );
}
