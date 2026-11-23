# IPA CENTER — GTA IPA Checker

## Local start
1. Install Node.js LTS.
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`

## Render Static Site
- Root Directory: blank
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variables: none

## iPhone home screen
Open the published HTTPS website in Safari → Share → Add to Home Screen.

## Important limitations
This project reads the IPA ZIP structure in the browser, extracts simple XML Info.plist metadata, and detects the presence of some signature-related files. It does NOT cryptographically validate signatures, verify provisioning profiles, establish iOS compatibility, sign apps, or install an IPA. A detected CodeResources file is not proof of a valid signature. Use only an Apple-authorized installation/distribution method for a properly signed compatible app.
