Name:           qtangl-sensor
Version:        0.1.0
Release:        1%{?dist}
Summary:        Qtangl Unified Sensor

License:        Proprietary
URL:            https://www.qtangl.com
BuildArch:      x86_64

%description
Host crypto discovery agent for certificates, libraries, and TLS listeners.

%files
%{_bindir}/qtangl-sensor
%{_unitdir}/qtangl-sensor.service

%install
install -D -m 0755 qtangl-sensor %{buildroot}%{_bindir}/qtangl-sensor
install -D -m 0644 packaging/systemd/qtangl-sensor.service %{buildroot}%{_unitdir}/qtangl-sensor.service
