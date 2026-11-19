# SNS dashboard refresh — 2026-11-19

Source: signed-in Aside browser, Instagram, Facebook, X, YouTube and Naver Blog account screens. No platform API keys are used. Snapshot saved at 16:21 KST; collection ran from 16:12 to 16:21.

| Channel | Followers / subscribers / neighbors | Posts | Views | Likes |
| --- | ---: | ---: | ---: | ---: |
| Instagram | 5 | 24 | 10,128 | 90 |
| Facebook | 1 | 24* | 328 | 1 |
| X | 1 | 28 | 692 | 1 |
| YouTube | 1 | 19 | 157 | 1 |
| Naver Blog | 1 | 24 | 65 | 2 |

- Facebook views and reactions were checked manually in Professional Dashboard after the collector retained old values. The visible reporting period was October 22–November 18, the latest 28 days.
- *Facebook post count and top-content metrics, plus Naver top-content metrics, retain the previous verified readings. `kept` records these fields; the dashboard labels them as previous readings.
- Naver views combine October's monthly total with recorded November daily totals; the latest available day was November 18. X views cover the 28 loaded posts. Instagram views cover Reels. YouTube views cover the channel's 19 Shorts.
- The displayed 11,370 views combine different reporting periods and are explicitly labeled as a reference total. Followers/subscribers/neighbors total 9; posts total 119, including the retained Facebook count.
- Updated the JSON snapshot, daily history, Naver daily records, and the HTML fallback together. Collector and single-channel check now use the current installed Aside CLI path, with `ASIDE_EXE` override supported.

Verification: dashboard checked at 320, 390, 768 and 1440px. All five rows, date, reference total and document width checked against JSON. JavaScript-disabled HTML fallback checked against the same snapshot. Final-project mobile-map/community layouts also passed public checks at the same four widths in deployed commit `50bd102`.
