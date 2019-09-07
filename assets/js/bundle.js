/**
 * @preserve
 * Developed by Sudhanshu Vishnoi
 * (https://github.com/sidvishnoi)
 * Copyright 2018
 */

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
const GA_TRACKING_ID = 'UA-113942220-1';

// print that status message in console :D
const pprint = {
  ct: `${'\u00a0'.repeat(13)}Hey you, Hackerman!${'\u00a0'.repeat(16)}
${'\u00a0'.repeat(2)}I see you are interested in the source code.${'\u00a0'.repeat(2)}
${'\u00a0'.repeat(13)}Let me help you :)${'\u00a0'.repeat(17)}`,
  st: 'background: #bada55;color:#000;font-weight: bold;',
};
console.log(`%c${pprint.ct}`, pprint.st);
console.log(`%c${'\u00a0'.repeat(1)}https://github.com/sidvishnoi/sankalan-2018${'\u00a0'.repeat(2)}`, 'color: yellow;padding:4px;background:#000');

const isFrontPage = () =>
  window.location.pathname.replace('index.html', '') === '/sankalan-2018/';

if (isFrontPage()) {
  document.body.classList.add('is-front-page');
}

/* eslint no-param-reassign: ["error", {
  "props": true,
  "ignorePropertyModificationsFor": ["line"],
}] */

class Background {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.style.background = '#000';
    this.ctx = canvas.getContext('2d');
    this.polylines = [];
    this.frameCount = 0;

    const TAU = Math.PI * 2;
    const ISO_ANGLE = TAU * (45 / 360);
    this.ANGLES = [ISO_ANGLE, -ISO_ANGLE, Math.PI - ISO_ANGLE, Math.PI + ISO_ANGLE];
    this.NUM_LINES = 10;
    this.NUM_SEGMENT = 8;
    this.SEGMENT_LENGTH = 120;
    this.RESET_FACTOR = 5;
  }

  // convert {r,g,b} to rgba string
  static createRgbString(color) {
    return `rgb(${color.r},${color.g},${color.b})`;
  }

  // random integer in range [0, m)
  static randomInt(m) {
    return Math.floor(Math.random() * m);
  }

  /**
   * Build or reset a line with a random color and empty points.
   */
  buildLine(line) {
    const obj = line || {};
    obj.color = {};
    obj.color.r = this.constructor.randomInt(3 * 64);
    obj.color.g = this.constructor.randomInt(2 * 64);
    obj.color.b = this.constructor.randomInt(4 * 64);
    obj.points = [];
    return obj;
  }

  /**
   * Random isometric angle
   */
  nextAngle() {
    const idx = this.constructor.randomInt(this.ANGLES.length);
    return this.ANGLES[idx];
  }


  /**
  * Next point is a random point within four angles from the start.
  * @param line the array of points to add to.
  * @param i the last index to start from
  * @param point the default starting point.
  */
  getNextPoint(line, i, point) {
    const nextPoint = point || {};
    line.angle = this.nextAngle(line.angle);
    nextPoint.x = line.points[i - 1].x + (Math.cos(line.angle) * this.SEGMENT_LENGTH);
    nextPoint.y = line.points[i - 1].y + (Math.sin(line.angle) * this.SEGMENT_LENGTH);
    line.points.push(nextPoint);
  }

  /**
   * Init a polyline
   */
  initPolyLine(line) {
    line.points.push({
      x: this.constructor.randomInt(this.canvas.width),
      y: this.constructor.randomInt(this.canvas.height),
    });
    for (let i = 1; i < this.NUM_SEGMENT; i += 1) {
      this.getNextPoint(line, i);
    }
    return line;
  }

  /**
   * Draw a line on the canvas.
   */
  drawLine(line) {
    this.ctx.strokeStyle = this.constructor.createRgbString(line.color);
    for (let i = 1; i < line.points.length; i += 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(line.points[i - 1].x, line.points[i - 1].y);
      this.ctx.lineTo(line.points[i].x, line.points[i].y);
      this.ctx.stroke();
    }
  }

  /**
   * check if point is inside the canvas region
   */
  isPointInside(point) {
    return (point.y > 0
      && point.y < this.canvas.height
      && point.x < this.canvas.width
      && point.x > 0);
  }

  // reset a line
  resetLine(line) {
    const idx = this.polylines.indexOf(line);
    const removedLine = this.polylines.splice(idx, 1)[0];
    const newLine = this.buildLine(removedLine); // reset the line
    const newPolyline = this.initPolyLine(newLine);
    this.polylines.push(newPolyline);
  }

  /**
   * make a line move down
   */
  moveLine(line) {
    for (let i = 0; i < line.points.length; i += 1) {
      line.points[i].y += 0.01;
    }
    // check if point is out of view
    const pointsInside = line.points.filter(l => this.isPointInside(l));

    // if line has no point in view, reset it
    if (pointsInside.length === 0) {
      this.resetLine(line);
    }
  }

  /**
   * Makes the lines go down.
   */
  move() {
    for (const line of this.polylines) {
      this.moveLine(line);
    }
  }

  /**
  * Removes first point from the line and add a new one.
  */
  shiftPoint(line) {
    const firstPoint = line.points.shift();
    this.getNextPoint(line, line.points.length, firstPoint);
  }

  /**
   * starts animation
   */
  animate() {
    this.canvas.width = this.canvas.width; // clear canvas

    // draw
    this.move();
    for (const line of this.polylines) {
      this.drawLine(line);
    }

    if (this.frameCount % this.RESET_FACTOR === 0) {
      this.frameCount = 0;
      for (const line of this.polylines) {
        this.shiftPoint(line);
      }
    }
    this.frameCount += 1;
    return window.requestAnimationFrame(this.anim);
  }

  /**
   * Resize canvas to viewport dimensions.
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    for (let i = 0; i < this.NUM_LINES; i += 1) {
      const line = this.buildLine();
      this.polylines.push(line);
    }
    for (let i = 0, l = this.polylines.length; i < l; i += 1) {
      this.initPolyLine(this.polylines[i]);
    }
    // .forEach(this.initPolyLine);
    this.anim = this.animate.bind(this);
    this.resize();
    this.animate();
    window.addEventListener('resize', this.resize);
  }
}

const $canvas = document.getElementById('canvas');
const bg = new Background($canvas);
bg.init();

/* global loadJs gtag GA_TRACKING_ID */

let initLoader;
let trackClicks;
const maxDelay = 600; // if request takes more than this much ms, we won't show user the "loading"
let reqStartTime;

const changeHistory = (page) => {
  document.title = page.title;
  window.history.pushState(page, page.title, page.link);
};

const showLoader = () => {
  document.body.classList.add('loading');
};

const hideLoader = (callback = () => {}) => {
  let delay = new Date() - reqStartTime;
  if (delay > maxDelay) {
    delay = 0;
  } else {
    delay = maxDelay - delay;
  }
  window.setTimeout(() => {
    document.body.classList.remove('loading');
    callback();
  }, delay);
};

const showContent = (json) => {
  const main = document.getElementById('main');
  const isHomePage = json.slug === '';
  if (isHomePage) {
    document.body.classList.add('is-front-page');
  } else {
    document.body.classList.remove('is-front-page');
  }
  if (!json.link) throw new Error('bad content');

  window.scrollTo(0, 0);
  hideLoader(() => {
    main.innerHTML = json.content;
    initLoader();
    trackClicks();
  });

  // track page view
  gtag('config', GA_TRACKING_ID, {
    page_title: json.title,
    page_path: json.link,
  });

  return json;
};

const setURL = (href) => {
  const path = href.split(window.location.host)[1];
  window.history.replaceState(window.history.state, document.title, path);
};

const loadPage = (href) => {
  const pastUrl = window.location.href;
  // change url so that slow requests don't lead to full page reload (due to trackClicks() callback)
  setURL(href);

  const parseResponse = (res) => {
    const contentType = res.headers.get('Content-Type');
    if (!res.ok) {
      return Promise.reject(new Error(res.statusCode));
    } else if (!contentType.includes('application/json')) {
      return Promise.reject(new Error('invalid response'));
    }
    return Promise.resolve(res.json());
  };

  const cacheResponse = (json) => {
    const localStorageKey = href.split(window.location.host)[1];
    window.localStorage.setItem(localStorageKey, JSON.stringify(json));
    window.localStorage.setItem(`t-${localStorageKey}`, new Date().valueOf());
    return Promise.resolve(json);
  };

  const handleLoadError = (err) => {
    console.error(err);
    setURL(pastUrl); // reset url and history
    hideLoader();
  };

  let url = href;
  if (url.substr(-1) === '/') {
    url += 'index.json';
  } else if (url.endsWith('/index.json')) {
    /* do nothing */
  } else {
    url += '/index.json'; // when url ends without a trailing slash
  }

  // get from local storage if available and appropriate
  const localStorageKey = href.split(window.location.host)[1];
  const t = window.localStorage.getItem(`t-${localStorageKey}`);
  const lastFetchTime = new Date(parseInt(t, 10));
  if (new Date() - lastFetchTime < 300 * 1000) { // cache time 5min
    const json = JSON.parse(window.localStorage.getItem(localStorageKey));
    return new Promise(resolve => resolve(json))
      .then(showContent)
      .then(changeHistory)
      .then(initLoader)
      .catch(handleLoadError);
  }

  return window.fetch(url)
    .then(parseResponse)
    .then(cacheResponse)
    .then(showContent)
    .then(changeHistory)
    .then(initLoader)
    .catch(handleLoadError);
};

window.onpopstate = ({ state }) => {
  if (!state || !state.link) {
    window.location.href = window.location.href;
  }

  reqStartTime = new Date().valueOf() + 250;
  const { link } = state;
  showLoader();
  setURL(window.location.host + link);
  showContent(state);
};

const loaderListener = (e) => {
  e.preventDefault();
  const target = e.target.closest('a');
  if (e.ctrlKey) {
    window.open(target.href, '_blank');
    return;
  }
  reqStartTime = new Date();
  showLoader();
  loadPage(target.href);
};

initLoader = () => {
  const links = document.querySelectorAll('a.xhr');

  for (const link of links) {
    link.removeEventListener('click', loaderListener, true);
    const { href } = link;
    const relHref = href.replace(`${window.location.protocol}//${window.location.host}`, '');
    if (relHref === href) {
      continue; // is external
    }
    if (href === window.location.href) {
      link.addEventListener('click', e => e.preventDefault());
      continue;
    }
    link.addEventListener('click', loaderListener, true);
  }
};

// track all clicks
trackClicks = () => {
  const links = document.querySelectorAll('a');
  const isExternal = url =>
    !url.includes(window.location.host);

  const fn = (e) => {
    e.preventDefault();
    let done = false;
    const target = e.target.closest('a');
    const label = target.dataset.id || target.innerText;
    const { href } = target;
    const action = href.split(window.location.host)[1] || href;
    const callback = () => {
      if (!done && document.location.href !== href && !target.classList.contains('xhr')) {
        if (target.getAttribute('target') === '_blank' || e.ctrlKey) {
          window.open(href, '_blank');
        } else {
          document.location.href = href;
        }
      }
      done = true;
    };
    const props = {
      event_category: 'Click Open',
      event_label: label,
      event_callback: callback,
    };
    if (isExternal(href)) {
      if (!done) setTimeout(callback, 1000);
      props.transport_type = 'beacon';
    }
    gtag('event', action, props);
  };

  for (const link of links) {
    link.addEventListener('click', fn, false);
  }
};

initLoader();
trackClicks();

// google analytics
loadJs('https://www.googletagmanager.com/gtag/js?id=UA-113942220-1');

gtag('js', new Date());

gtag('config', GA_TRACKING_ID);

//# sourceMappingURL=bundle.js.map
