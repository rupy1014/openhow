// 태섭 캐릭터 이미지 (ai-jobdori 공유, narrator로 리네임)

export const NARRATOR_IMAGES = [
  "assets/characters/narrator/narrator-01.png",
  "assets/characters/narrator/narrator-02.png",
  "assets/characters/narrator/narrator-03.png",
  "assets/characters/narrator/narrator-04.png",
  "assets/characters/narrator/narrator-05.png",
  "assets/characters/narrator/narrator-06.png",
];

/**
 * 에피소드 번호에 따라 캐릭터 이미지 로테이션
 * EP1 → narrator-01, EP2 → narrator-02, ..., EP7 → narrator-01
 */
export function getNarratorImage(episodeNumber: number): string {
  return NARRATOR_IMAGES[(episodeNumber - 1) % NARRATOR_IMAGES.length];
}
