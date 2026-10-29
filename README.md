# 정다운 포트폴리오 사이트

빌드 과정이 없는 정적 사이트입니다. 이 폴더(`portfolio-site`)만 그대로 올리면 됩니다.

## 구성

| 파일 | 내용 |
| --- | --- |
| `index.html` | 홈 — 소개 문구, 최근 기획, 전체 목록(Index, 분류 필터) |
| `work.html` | 전시·글 상세 페이지 (`work.html?id=항목id`) |
| `about.html` | 소개·이력. 「CV를 PDF로 저장」 버튼은 인쇄용 레이아웃으로 PDF를 만듭니다 |
| `404.html` | 없는 주소로 들어왔을 때 보이는 페이지 |
| `assets/content.js` | **모든 내용** — 전시, 글, 강의, 이력 |
| `assets/app.js` | 화면 그리는 코드 (고칠 일 거의 없음) |
| `assets/style.css` | 디자인 (포인트 색은 맨 위 `--accent`) |
| `images/` | 포스터·도록 이미지. `og.jpg`는 카카오톡·SNS에 링크를 공유할 때 보이는 미리보기 이미지 |
| `favicon.svg`, `favicon.png` | 브라우저 탭 아이콘 |

## 내용 고치기

`assets/content.js`만 열어서 고치면 됩니다.

- 새 전시를 추가하려면 `entries` 안의 기획 항목 하나를 복사해 붙여 넣고 `id`, `title`, `date` 등을 바꿉니다.
- 이미지는 `images/` 폴더에 넣고 `image: '파일이름.jpg'`로 적습니다.
- 홈 상단의 「최근 기획」은 `profile.featured`에 적은 id의 항목이 나옵니다.
- 영문 이름은 `profile.nameEn`, 인스타그램 주소는 `profile.instagram`에서 바꿉니다.
- 홈 첫 화면 오른쪽의 현재 직함·위원 정보는 `homeMeta`, 홈 아래쪽 검은 ABOUT 띠는 `homeAbout`에서 바꿉니다.
- 소개 페이지의 약력과 이력은 `bio`와 `cv`에서 바꿉니다.

## 미리 보기

터미널에서 이 폴더로 이동한 뒤:

```bash
python3 -m http.server 8123
```

브라우저에서 http://localhost:8123 을 엽니다.

## 공개하기

GitHub 저장소 `daunarte/daunarte.github.io`의 `main` 브랜치에 올리면 https://daunarte.github.io 에 1~2분 뒤 반영됩니다.
이 폴더 안의 파일만 올리세요.
