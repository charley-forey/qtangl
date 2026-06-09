# MSI packaging

Build with WiX Toolset v4:

```powershell
wix build qtangl-sensor.wxs -o qtangl-sensor-0.1.0.msi
```

Silent install properties: `ENROLLMENT_TOKEN`, `QTANGL_API_URL`.

See [host-sensor-windows-gpo.md](../../../docs/guides/host-sensor-windows-gpo.md) for Intune/GPO deployment.
