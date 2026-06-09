# Windows GPO deployment for Qtangl sensor

## MSI silent install

```powershell
msiexec /i qtangl-sensor-0.1.0.msi /qn ENROLLMENT_TOKEN=YOUR_TOKEN QTANGL_API_URL=https://api.qtangl.com
```

## Intune

1. Package `qtangl-sensor.intunewin` with Win32 app wizard
2. Install command: `qtangl-sensor.exe --enroll %ENROLLMENT_TOKEN%`
3. Detection: file `C:\Program Files\Qtangl\qtangl-sensor.exe`

## GPO scheduled task

Deploy `qtangl-sensor --push` daily via Group Policy Preferences → Scheduled Tasks.
