# report 카드 이미지

카드는 아래 1:1 PNG 픽셀 아트를 고정 사용합니다. 기존 카드의 녹색 팔레트, 사각 픽셀과 디더링을 맞춰 built-in imagegen으로 제작했습니다. API 응답의 원본 사진은 탐색기 팝업에서만 사용합니다.

- `arte-pixel.png`: 아르떼뮤지엄 부산 GARDEN STARRY BUSAN. 참고 원본 `arte.png`, [공식 부산 페이지](https://kr.artemuseum.com/BUSAN).
- `museum1-pixel.png`: 뮤지엄 원의 원통형 미디어 설치 공간. 참고 원본 `museum1.jpg`, [한국관광공사 제공 사진](https://tong.visitkorea.or.kr/cms/resource/01/3493601_image2_1.jpg).
- `hurshim-pixel.png`: 허심청 돔·온천탕. 참고 원본 `hurshim.jpg`, [한국관광공사 제공 사진](https://tong.visitkorea.or.kr/cms/resource/37/4090237_image2_1.jpg).

원본 사진 파일은 팝업의 API 미연결 대체 사진으로도 사용합니다. 한국관광공사 원본 두 장은 공공누리 제3유형으로 제공되며 원본 파일은 변형하지 않았습니다. 픽셀 이미지는 사진 원본과 별도의 AI 일러스트로 표시합니다.

## 최종 생성 프롬프트

각 프롬프트에 장면 참고 사진을 첫 번째 이미지로, 기존 `assets/busan-museum-of-art.png`를 두 번째 스타일 참고 이미지로 첨부했습니다. 투명 배경은 사용하지 않았습니다.

공통 지시문:

> Use case: style-transfer. Create ONE square 1:1 raster website card illustration. Image 1 is the scene/photo reference; image 2 is the exact style reference from the same website. Render the entire illustration as convincing crisp 8-bit pixel art with visible square pixels, stepped contours and restrained ordered dithering, matching image 2's pixel scale and retro terminal feeling. Limited palette: deep black-green shadows, forest greens, emerald, pale mint highlights; no purple, blue, gold or other hue families. Recompose the view naturally into a full-bleed square, preserve proportions and recognizable architecture; NEVER stretch or squash the photo. No decorative frame, no text, no labels, no lettering, no logo or watermark. Finished asset should feel part of the same image series as image 2, not a smooth photo under a green filter.

장면별 지시문:

- 아르떼: ARTe Museum BUSAN immersive GARDEN STARRY BUSAN interior: the panoramic projection of Busan hillside houses and coastal city lights extends from left distant wall to near right wall, reflections on dark floor; preserve the supplied photo scene and perspective, not a generic museum exterior.
- 뮤지엄 원: Museum 1 Busan interior with its suspended clear vertical cylindrical digital-art installations at center foreground, mirrored modern gallery with overhead beams, multiple displays and reflections. Preserve the distinctive suspended-cylinder installation and spatial structure in the supplied photo.
- 허심청: Hurshimchung Busan hot spring interior: sweeping high circular glass-and-rib dome above, tiered curved blue-tiled bathing pools with a central sculptural fountain, side railings and some indoor plants. Preserve the recognizable dome ribs and pool arrangement from the supplied photo.

## 2026-11-18 추가 카드 (부산근현대역사관 · 깡깡이예술마을 · 도모헌)

`mmch-pixel.webp`, `kangkangee-pixel.webp`, `domoheon-pixel.webp`는 아래 사진을 1:1로 자른 뒤 114px 격자로 줄이고, 기존 카드의 녹색 13단계 팔레트와 4×4 순서 디더링으로 변환해 확대한 이미지입니다(AI 생성 아님).

- 부산근현대역사관: 한국관광공사 4113502 (공공누리 제1유형) → `mmch.jpg`, 팝업 보조 `mmch-2.jpg`(4130220)
- 깡깡이예술마을: 한국관광공사 2947325 (공공누리 제1유형) → `kangkangee.jpg`, 팝업 보조 `kangkangee-2.jpg`(2947327)
- 도모헌: 부산시 도모헌 공식 사이트 '여름의 도모헌'(2026-07-31) → `domoheon.jpg`, 팝업 보조 `domoheon-2.jpg`(소소풍 정원)

세 곳은 API 연동 대상이 아니며 운영 정보는 카드뉴스 제작 때 확인한 공식 안내 기준입니다.

## 2026-11-18 이미지 교체 · 6곳 추가

[7]–[15]의 카드 이미지는 모두 TapNow `gpt-image-2`(1:1, medium)로 생성한 픽셀 일러스트입니다. 장면 참고 사진을 첫 번째, `hurshim-pixel.webp`를 스타일 참고로 두 번째 이미지로 넣고 위 공통 지시문을 그대로 썼습니다.
추가 6곳(F1963·고은사진미술관·영화의전당·흰여울문화마을·부산박물관·복천박물관)의 탐색기 사진 `<key>-1.jpg`, `<key>-2.jpg`는 한국관광공사 TourAPI 원본을 변형 없이 사용합니다(흰여울 2장과 goeun-2는 공공누리 제1유형, 나머지는 제3유형). 조사 기록: `outputs/report-cards-20261118/`.

## 2026-11-23 모션 카드뉴스

탐색기 15곳의 모션 카드뉴스는 `report-motion.js`에 장소별 장면과 출처가 있고, `report-motion.css`에서 사진과 문구의 전환을 처리합니다. 부산현대미술관 5개 장면에는 아래의 서로 다른 기록 사진을 사용했습니다. 부산관광공사 부산관광아카이브 제공, 공공누리 제2유형. 웹 전송을 위해 크기와 파일 형식을 조정했습니다.

- `motion/moca-1.webp` [METADATA019846](https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA019846)
- `motion/moca-2.webp` [METADATA019848](https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA019848)
- `motion/moca-3.webp` [METADATA019850](https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA019850)
- `motion/moca-4.webp` [METADATA019857](https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA019857)
- `motion/moca-5.webp` [METADATA019851](https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA019851)

다른 장소는 기존 탐색기 사진을 사용합니다. 한국관광공사 제3유형 사진은 원본 파일을 그대로 표시합니다. 원본을 한 장만 확보한 뮤지엄 원·아르떼뮤지엄 부산·허심청은 두 번째 장을 사진 없는 관람 안내로 구성했습니다.
