Bank BMS - WinCC Unified Custom Web Control
=============================================

GUID:
{FFC493E6-5085-418D-A5FF-419B085A2B80}

First live PLC property:
- Property: InstantPower
- Manifest type: number
- Intended PLC source: WinCC Unified PLC tag with data type Real
- Display: Dashboard -> مصرف لحظه‌ای

Folder structure:
manifest.json
assets/bankBMS.ico
control/index.html
control/styles.css
control/js/main.js
control/js/webcc.min.js
control/js/screen.min.js

In TIA Portal:
1. Copy/use this package as a Custom Web Control.
2. Insert "Bank BMS Dashboard" on a Unified screen.
3. In the control's Interfaces/Properties, locate "InstantPower".
4. Connect/bind InstantPower to the desired PLC Real tag.
5. Download to Runtime and verify the "مصرف لحظه‌ای" value.

The browser-side JavaScript does NOT connect directly to the PLC.
WebCC receives the property value from WinCC Unified.
