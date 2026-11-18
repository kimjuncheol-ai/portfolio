# Full portfolio and Report deep review — 2026-11-18

This extends the prior first-viewport audit to hidden tabs, every rail item, dialogs and the bottom of each page. Unslop polish keeps the intentional terminal identity, public content, colors and fonts. Guidance: Unslop by Damir Sokolovsky (https://heydamir.design/unslop), CC BY 4.0.

## Reviewed

- index/about/contents/sns at 320/390/768/1440px: 16 cases, 68 tab/series states, 588 rail-item visits. Visible lazy images decoded, End/Home and arrows, mobile menu/Escape, collapsed details, footer, and contents video viewer navigation/focus return. No document overflow, hard vertical clipping, missing local media or JS errors.
- Report: 15 cards, four widths, 304 card/dialog/focus states. All 30 popup photos decoded. Official links 15 and three additional program links returned HTTP 200 (two initial transient failures recovered on retry). API failure kept edited data; retry restored live state. Actual facts such as future hours/availability were not independently re-researched.
- Final: current responsive project tests retained; real home/map/community/guide screens load, roles and links retained. Shared site layout, metadata and nested frame project metadata also checked.

## Issues corrected

1. Report title/description metadata still said six resources; aligned it to all 15 while retaining the documented six API-backed resources and nine edited resources.
2. Report folder changes retained the previous content scroll position. Reset the content pane to the top on every selection.
3. Five motion-card videos continued after the dialog closed. Pause all dialog videos on close.
4. Selected report folder was indicated only visually. Set aria-current and aria-controls on folder buttons.
5. Previous text check only sampled p/small/figcaption. This audit also inspected leaf DT/DD/SPAN labels: about color values were 9.6px, color labels 9.28px, some archive labels 10.4–10.88px. Unified these informational labels to an 11px floor without changing content/grid.
6. Offline/live chatbot FAQs still said final was empty and Report contained six places. Updated exactly five public-page FAQ rows, preserving unrelated data. Generator imports the same current FAQ facts to avoid restoring obsolete answers. Three generic live queries passed; their audit-only session was withdrawn afterward.
7. projects/frame metadata referenced a missing PNG; corrected to the existing WebP portrait. Schema validator now accepts valid HTTP(S) URLs: the actual Kangkangee official HTTP site responds successfully, while HTTPS fails TLS, so its verified original URL was preserved.
8. Added the ending blinking prompt to SNS/final, and moved Report's nested prompt to the same last-child position as other archive pages. All five archive pages have one ending prompt, a 16px gap from the preceding visible section, and static page titles. The user's requested blinking footer is an intentional motion exception.

## Regression evidence

- 180 Report tab selections after the changes: current-folder state and scrollTop=0 passed.
- 5 videos × 4 widths: paused after dialog close and playback time unchanged 500ms later.
- 20 ending-prompt viewport/page cases: exactly one, blink animation, 16px gap, page heading animation off.
- All 8 structured-data documents passed syntax, schema domains/ranges, local asset and visible-content correspondence.
- BEFORE JSON deliberately retains the defects observed; AFTER JSON records fixed behavior.

Commands (preview server expected at 8791):

    node scripts/check-report-interactions.cjs
    node scripts/check-ending-prompts.cjs
    node scripts/validate-structured-data.cjs tmp/schemaorg-vocabulary.json

Browser scripts accept UI_AUDIT_URL for deployed verification and PLAYWRIGHT_MODULE when Playwright is in the shared runtime. No image generation or brand redesign was required. Authenticated social post access and full external video playback quality were not part of this check.
