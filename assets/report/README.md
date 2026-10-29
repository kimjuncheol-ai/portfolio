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
