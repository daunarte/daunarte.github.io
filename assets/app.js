/* 정다운 포트폴리오 — 페이지 렌더링. 내용은 content.js에서 고칩니다. */
(function () {
  'use strict';

  var SITE = window.SITE;
  var P = SITE.profile;
  var CATS = [
    { id: 'all', label: '전체' },
    { id: 'curating', label: '기획' },
    { id: 'writing', label: '글' },
    { id: 'teaching', label: '교육' }
  ];
  var CAT_LABEL = { curating: '기획', writing: '글', teaching: '교육' };

  // 작은 DOM 헬퍼: 텍스트는 항상 textContent로 넣는다.
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'class') node.className = v;
        else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function yearKey(e) {
    var m = String(e.year).match(/\d{4}/);
    return m ? Number(m[0]) : 0;
  }

  function sorted(list) {
    return list.slice().sort(function (a, b) {
      return yearKey(b) - yearKey(a) || (b.order || 0) - (a.order || 0);
    });
  }

  function hasPage(e) {
    return e.cat !== 'teaching' && Boolean(e.body || e.summary || e.image);
  }

  function workHref(e) {
    return 'work.html?id=' + encodeURIComponent(e.id);
  }

  function byId(id) {
    for (var i = 0; i < SITE.entries.length; i++) {
      if (SITE.entries[i].id === id) return SITE.entries[i];
    }
    return null;
  }

  /* ── 공통: 헤더·푸터 채우기 ── */
  function fillCommon() {
    document.querySelectorAll('[data-name-en]').forEach(function (n) { n.textContent = P.nameEn; });
    document.querySelectorAll('[data-email]').forEach(function (n) {
      n.textContent = P.email;
      n.setAttribute('href', 'mailto:' + P.email);
    });
    document.querySelectorAll('[data-instagram]').forEach(function (n) {
      if (P.instagram) n.setAttribute('href', P.instagram);
      else n.remove();
    });
    document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  }

  /* ── 홈 ── */
  // 줄 목록을 <br>로 이어 붙인다
  function lines(list) {
    var out = [];
    list.forEach(function (t, i) {
      if (i) out.push(el('br'));
      out.push(t);
    });
    return out;
  }

  function renderHomeText() {
    var meta = document.getElementById('hero-meta');
    if (meta && SITE.homeMeta) {
      SITE.homeMeta.forEach(function (m) {
        meta.appendChild(el('div', {}, [el('dt', { class: 'label', text: m[0] }), el('dd', {}, lines(m[1]))]));
      });
    }
    var A = SITE.homeAbout;
    var lead = document.getElementById('about-lead');
    var cols = document.getElementById('about-cols');
    if (A && lead) lead.textContent = A.text;
    if (A && cols) {
      A.cols.forEach(function (c) {
        cols.appendChild(el('div', {}, [el('span', { class: 'label', text: c[0] })].concat(lines(c[1]))));
      });
    }
  }

  function renderFeatured() {
    var mount = document.getElementById('featured');
    var e = byId(P.featured);
    if (!mount || !e) return;
    mount.appendChild(el('a', { class: 'feature-link', href: workHref(e) }, [
      e.image ? el('div', { class: 'feature-img' }, [el('img', { src: 'images/' + e.image, alt: e.imageAlt || e.title, loading: 'eager' })]) : null,
      el('div', { class: 'feature-body' }, [
        el('p', { class: 'label accent', text: '최근 기획 — ' + e.year }),
        el('h2', { text: e.title }),
        el('p', { class: 'meta', text: [e.date, e.place].filter(Boolean).join(' · ') }),
        e.summary ? el('p', { class: 'lede', text: e.summary }) : null,
        el('span', { class: 'feature-more', text: '프로젝트 보기 →' })
      ])
    ]));
  }

  function renderIndex() {
    var filterMount = document.getElementById('filters');
    var rowsMount = document.getElementById('rows');
    if (!filterMount || !rowsMount) return;

    var all = sorted(SITE.entries);
    var initial = (location.hash || '').slice(1);
    var current = CAT_LABEL[initial] ? initial : 'all';

    var buttons = CATS.map(function (c) {
      var count = c.id === 'all' ? all.length : all.filter(function (e) { return e.cat === c.id; }).length;
      var b = el('button', {
        class: 'pill', type: 'button', 'aria-pressed': String(c.id === current),
        onclick: function () { select(c.id, true); }
      }, [c.label, el('span', { class: 'count', text: String(count) })]);
      b.dataset.cat = c.id;
      filterMount.appendChild(b);
      return b;
    });

    function draw() {
      rowsMount.textContent = '';
      var list = current === 'all' ? all : all.filter(function (e) { return e.cat === current; });
      if (!list.length) {
        rowsMount.appendChild(el('p', { class: 'row-empty', text: '아직 항목이 없습니다.' }));
        return;
      }
      list.forEach(function (e) {
        var cells = [
          el('span', { class: 'row-year', text: e.year }),
          el('span', { class: 'row-kind', text: e.kind || CAT_LABEL[e.cat] }),
          el('span', { class: 'row-title', text: e.title }),
          el('span', { class: 'row-place', text: e.place || '' })
        ];
        rowsMount.appendChild(hasPage(e)
          ? el('a', { class: 'row', href: workHref(e) }, cells)
          : el('div', { class: 'row' }, cells));
      });
    }

    function select(id, push) {
      current = id;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cat === id)); });
      if (push) history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id);
      draw();
    }

    // 상단 메뉴의 기획/글/교육 링크(#curating 등)로 들어와도 필터가 맞춰지도록
    window.addEventListener('hashchange', function () {
      var h = location.hash.slice(1);
      if (CAT_LABEL[h]) {
        select(h, false);
        document.getElementById('index').scrollIntoView();
      }
    });

    // 주소가 이미 #writing일 때 메뉴의 '글'을 다시 누르면 hashchange가 안 생기므로 직접 처리
    document.querySelectorAll('a[href^="index.html#"]').forEach(function (a) {
      var h = a.getAttribute('href').split('#')[1];
      if (!CAT_LABEL[h]) return;
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        select(h, true);
        document.getElementById('index').scrollIntoView();
      });
    });

    draw();
    // 위쪽 이미지가 다 불러와진 뒤에 스크롤해야 위치가 어긋나지 않는다
    if (CAT_LABEL[initial]) {
      window.addEventListener('load', function () { document.getElementById('index').scrollIntoView(); });
    }
  }

  /* ── 상세 ── */
  function renderWork() {
    var mount = document.getElementById('work');
    if (!mount) return;
    var id = new URLSearchParams(location.search).get('id');
    var e = id && byId(id);

    if (!e || !hasPage(e)) {
      mount.appendChild(el('div', { class: 'detail-head' }, [
        el('h1', { text: '찾는 페이지가 없습니다.' })
      ]));
      mount.appendChild(el('p', {}, [el('a', { class: 'accent', href: 'index.html#index', text: '← 전체 목록으로' })]));
      return;
    }

    document.title = e.title + ' — ' + P.nameKo;

    mount.appendChild(el('nav', { class: 'crumb', 'aria-label': '위치' }, [
      el('a', { href: 'index.html', text: '홈' }), '/',
      el('a', { href: 'index.html#' + e.cat, text: CAT_LABEL[e.cat] }), '/',
      el('span', { text: e.year })
    ]));

    mount.appendChild(el('header', { class: 'detail-head' }, [
      el('p', { class: 'kind', text: [e.kind, e.year].filter(Boolean).join(' — ') }),
      el('h1', { text: e.title }),
      e.titleEn ? el('p', { class: 'sub', text: e.titleEn }) : null
    ]));

    var facts = [
      ['일시', e.date], ['장소', e.cat === 'curating' ? e.place : null],
      ['수록', e.cat === 'writing' ? e.place : null],
      ['작가', e.artists], ['역할', e.role], ['주최·후원', e.org]
    ].filter(function (f) { return f[1]; });

    var dl = el('dl', { class: 'facts' });
    facts.forEach(function (f) {
      dl.appendChild(el('dt', { text: f[0] }));
      dl.appendChild(el('dd', { text: f[1] }));
    });

    var related = (e.related || []).map(byId).filter(function (r) { return r && hasPage(r); });

    var side = el('aside', { class: 'detail-side' }, [
      e.image ? el('figure', { class: 'detail-img', style: 'margin:0' }, [
        el('img', { src: 'images/' + e.image, alt: e.imageAlt || e.title })
      ]) : null,
      dl
    ]);

    var main = el('div', { class: 'detail-main' }, [
      e.summary ? el('p', { class: 'prose', style: 'font-size:20px', text: e.summary }) : null,
      e.body ? el('div', { class: 'prose' }, e.body.map(function (p) { return el('p', { text: p }); })) : null,
      e.excerpt ? el('p', { class: 'prose-note' }, [
        '글의 앞부분입니다. 전문은 ',
        el('a', { class: 'accent', href: 'mailto:' + P.email, text: '이메일' }),
        '로 요청해 주세요.'
      ]) : null,
      related.length ? el('section', { class: 'related' }, [
        el('h2', { text: '함께 보기' })
      ].concat(related.map(function (r) {
        return el('a', { href: workHref(r), text: CAT_LABEL[r.cat] + ' · ' + r.title + ' →' });
      }))) : null
    ]);

    mount.appendChild(el('div', { class: 'detail-grid' }, [side, main]));

    // 같은 분류 안에서 이전·다음
    var siblings = sorted(SITE.entries).filter(function (x) { return x.cat === e.cat && hasPage(x); });
    var i = siblings.indexOf(e);
    var prev = siblings[i - 1];
    var next = siblings[i + 1];
    if (prev || next) {
      mount.appendChild(el('nav', { class: 'pager', 'aria-label': '이전·다음' }, [
        prev ? el('a', { href: workHref(prev) }, [el('span', { class: 'label', text: '← 최근 항목' }), el('span', { class: 't', text: prev.title })]) : null,
        next ? el('a', { class: 'next', href: workHref(next) }, [el('span', { class: 'label', text: '지난 항목 →' }), el('span', { class: 't', text: next.title })]) : null
      ]));
    }
  }

  /* ── 소개 ── */
  function renderAbout() {
    var bio = document.getElementById('bio');
    var cv = document.getElementById('cv-sections');
    if (bio) bio.textContent = SITE.bio;
    if (cv) {
      SITE.cv.forEach(function (sec) {
        cv.appendChild(el('section', { class: 'cv-section' }, [
          el('h2', { text: sec.title }),
          el('ul', { class: 'cv-list' }, sec.items.map(function (it) {
            return el('li', { class: 'cv-item' }, [
              el('span', { class: 'when', text: it[0] }),
              el('span', {}, [it[1], it[2] ? el('span', { class: 'note', text: ' — ' + it[2] }) : null])
            ]);
          }))
        ]));
      });
    }
    var printBtn = document.getElementById('print-cv');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
  }

  fillCommon();
  var page = document.body.getAttribute('data-page');
  if (page === 'home') { renderHomeText(); renderFeatured(); renderIndex(); }
  if (page === 'work') renderWork();
  if (page === 'about') renderAbout();
})();
