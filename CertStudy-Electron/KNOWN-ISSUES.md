# Known Issues

## KB Links in Explanation Sidebar

**Status:** Investigating

**Problem:** KB links in the explanation sidebar (right panel) are not displaying correctly:
- Links DO open in browser when clicked
- URLs point to valid Nutanix portal documentation pages
- But link titles may not be visible or the content isn't rendering properly

**Investigation:**
- `referenceService.js` contains `KB_LINKS` mapping with keywords → title/url
- `getKBLinksForQuestion()` performs keyword matching against question text
- IPC handler in `main.js` now correctly passes question object format
- Renderer in `quiz-app.js` renders links as `<li><strong>${l.title}</strong><br><a>${l.url}</a></li>`

**Potential causes:**
1. CSS issue - link titles may not be visible due to styling
2. Keyword matching may not be finding matches for actual question content
3. Rendering timing - content may be cleared or overwritten

## Lab Simulator Blank Page

**Status:** Investigating

**Problem:** Lab simulator shows blank page when switching to Lab tab.

**Investigation:**
- Custom protocol `certstudy-lab://` is registered and serving files correctly
- Lab root resolves to `/home/user001/git/nutanixcertificationtool/CertStudy/LabSimulator/Web`
- CSP updated to allow `certstudy-lab:` for scripts, styles, fonts, images
- `index.html` loads ES modules via `<script type="module" src="js/app.js">`
- Protocol handler returns correct MIME types

**Potential causes:**
1. ES modules may have import errors in iframe context
2. Bridge client expecting C# bridge that doesn't exist in Electron
3. CSP may still be blocking something
4. iframe sandbox attribute may be too restrictive

**Current sandbox:**
```html
<iframe sandbox="allow-scripts allow-same-origin allow-popups">
```

## Malformed Questions (Expected Behavior)

Questions Q71-Q80 in `NCM-MCI-Part3.md` and `NCP-AI-Part4.md` are intentionally skipped:
- These are "Ordering/Sequence" type questions
- Do not have standard A/B/C/D option format
- Parser correctly identifies them as malformed for MCQ parsing
