const DEFAULT_CONFIG = {
  APPS_SCRIPT_URL: "",
  WHATSAPP_NUMBER: "918921696649",
  SHOPPING_URL: "https://www.freshly-online.com/freshlymart/#wellness"
};

const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.PRANAVAM_CONFIG || {});
CONFIG.APPS_SCRIPT_URL = String(CONFIG.APPS_SCRIPT_URL || CONFIG.WEBAPP_URL || '').trim();


let deferredInstallPrompt = null;
let sliderTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  updateSideActionLinks();
  loadMenu();
  initMobileMenu();
  initPWA();
  loadHeroSlider();
  loadSiteImages();
  loadPackages();
  loadPackageSelects();
  prefillFormsFromURL();
  handleForms();
});

function initMobileMenu(){
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  if (!toggle || !menu || toggle.dataset.bound === 'yes') return;
  toggle.dataset.bound = 'yes';
  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if(link && window.matchMedia('(max-width: 900px)').matches){
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

function updateSideActionLinks(){
  const whatsapp = document.querySelectorAll('.whatsapp-btn');
  whatsapp.forEach(a => a.href = `https://wa.me/${String(CONFIG.WHATSAPP_NUMBER || '').replace(/\D/g,'') || '918921696649'}`);
  document.querySelectorAll('a[href*="freshly-online.com"]').forEach(a => {
    if(a.textContent.trim().toLowerCase() === 'shopping') a.href = CONFIG.SHOPPING_URL || a.href;
  });
}

async function loadMenu(){
  const menu = document.querySelector('[data-menu]');
  if(!menu) return;
  let rows = await loadRowsFromBackend('menu', fallbackMenuRows());
  rows = rows
    .filter(row => (getVal(row,'Status') || 'Active').toLowerCase() === 'active')
    .filter(row => !['admin','install app','contact us'].includes((getVal(row,'MenuName','Name','Title') || '').toLowerCase()))
    .sort((a,b)=>Number(getVal(a,'SortOrder','Order') || 999) - Number(getVal(b,'SortOrder','Order') || 999));
  if(!rows.length) rows = fallbackMenuRows();
  menu.innerHTML = renderMenuHTML(rows);
  updateSideActionLinks();
}

function renderMenuHTML(rows){
  const byParent = {};
  rows.forEach(row => {
    const parent = getVal(row,'ParentID','ParentId','Parent') || '';
    if(!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(row);
  });
  const roots = byParent[''] || [];
  const html = roots.map(row => renderMenuItem(row, byParent)).join('');
  const hasShopping = html.toLowerCase().includes('>shopping<');
  return hasShopping ? html : html + `<a href="${escapeHTML(CONFIG.SHOPPING_URL || '#')}" target="_blank" rel="noopener">Shopping</a>`;
}

function renderMenuItem(row, byParent){
  const id = getVal(row,'MenuID','MenuId','ID');
  const name = getVal(row,'MenuName','Name','Title') || 'Menu';
  const link = getVal(row,'PageLink','Link','URL','Url') || '#';
  const children = id ? (byParent[id] || []) : [];
  if(children.length){
    return `<div class="dropdown"><button class="dropbtn" type="button">${escapeHTML(name)}</button><div class="dropdown-content">${children.map(child => renderSubMenuItem(child, byParent)).join('')}</div></div>`;
  }
  return menuAnchorHTML(name, link, row);
}

function renderSubMenuItem(row, byParent){
  const id = getVal(row,'MenuID','MenuId','ID');
  const name = getVal(row,'MenuName','Name','Title') || 'Menu';
  const link = getVal(row,'PageLink','Link','URL','Url') || '#';
  const children = id ? (byParent[id] || []) : [];
  if(children.length){
    return `<div class="subdrop">${menuAnchorHTML(name + ' ▸', link, row)}<div class="subdrop-content">${children.map(child => renderSubMenuItem(child, byParent)).join('')}</div></div>`;
  }
  return menuAnchorHTML(name, link, row);
}

function menuAnchorHTML(name, link, row){
  const open = (getVal(row,'OpenType','Target') || '').toLowerCase();
  const isExternal = /^https?:\/\//i.test(link);
  const target = open.includes('new') || isExternal ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${escapeHTML(link)}"${target}>${escapeHTML(name)}</a>`;
}

function fallbackMenuRows(){
  return [
    {MenuID:'MENU001', ParentID:'', MenuName:'Home', PageLink:'index.html', SortOrder:'1', Status:'Active'},
    {MenuID:'MENU002', ParentID:'', MenuName:'Online Programs', PageLink:'#', SortOrder:'2', Status:'Active'},
    {MenuID:'MENU003', ParentID:'MENU002', MenuName:'Online Yoga', PageLink:'yoga.html', SortOrder:'1', Status:'Active'},
    {MenuID:'MENU004', ParentID:'MENU002', MenuName:'Online Group Yoga', PageLink:'online-group-yoga.html', SortOrder:'2', Status:'Active'},
    {MenuID:'MENU005', ParentID:'MENU002', MenuName:'Corporate Chair Yoga', PageLink:'corporate-chair-yoga.html', SortOrder:'3', Status:'Active'},
    {MenuID:'MENU006', ParentID:'MENU002', MenuName:'Therapeutic Yoga', PageLink:'therapeutic-yoga.html', SortOrder:'4', Status:'Active'},
    {MenuID:'MENU007', ParentID:'MENU002', MenuName:'Online Karate', PageLink:'online-karate.html', SortOrder:'5', Status:'Active'},
    {MenuID:'MENU008', ParentID:'MENU002', MenuName:'Online Dance', PageLink:'online-dance.html', SortOrder:'6', Status:'Active'},
    {MenuID:'MENU009', ParentID:'MENU002', MenuName:'Online Music', PageLink:'online-music.html', SortOrder:'7', Status:'Active'},
    {MenuID:'MENU010', ParentID:'MENU002', MenuName:'Online Drawing', PageLink:'online-drawing.html', SortOrder:'8', Status:'Active'},
    {MenuID:'MENU011', ParentID:'', MenuName:'Offline Programs', PageLink:'#', SortOrder:'3', Status:'Active'},
    {MenuID:'MENU012', ParentID:'MENU011', MenuName:'Yoga', PageLink:'offline-classes.html#yoga', SortOrder:'1', Status:'Active'},
    {MenuID:'MENU013', ParentID:'MENU011', MenuName:'Karate', PageLink:'offline-classes.html#karate', SortOrder:'2', Status:'Active'},
    {MenuID:'MENU014', ParentID:'MENU011', MenuName:'Dance', PageLink:'offline-classes.html#dance', SortOrder:'3', Status:'Active'},
    {MenuID:'MENU015', ParentID:'MENU011', MenuName:'Music', PageLink:'offline-classes.html#music', SortOrder:'4', Status:'Active'},
    {MenuID:'MENU016', ParentID:'MENU011', MenuName:'Drawing', PageLink:'offline-classes.html#drawing', SortOrder:'5', Status:'Active'},
    {MenuID:'MENU017', ParentID:'', MenuName:'Packages', PageLink:'packages.html', SortOrder:'4', Status:'Active'},
    {MenuID:'MENU018', ParentID:'', MenuName:'Register', PageLink:'register.html', SortOrder:'5', Status:'Active'},
    {MenuID:'MENU019', ParentID:'', MenuName:'Teach With Us', PageLink:'become-a-teacher.html', SortOrder:'6', Status:'Active'},
    {MenuID:'MENU020', ParentID:'', MenuName:'Shopping', PageLink:CONFIG.SHOPPING_URL, SortOrder:'99', OpenType:'New', Status:'Active'}
  ];
}

function initPWA(){
  const btn = document.querySelector('#installAppBtn');

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('Service worker registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (btn) btn.classList.add('is-ready');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (btn) btn.classList.add('is-installed');
  });

  if (btn) {
    btn.addEventListener('click', async () => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        showToast('Pranavam Academy app is already installed.');
        return;
      }
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        return;
      }
      showToast('To install: open browser menu and choose Add to Home Screen or Install App.');
    });
  }
}

function showToast(message){
  let toast = document.querySelector('.app-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3600);
}

function parseCSV(text){
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"' && q && n==='"'){ cell+='"'; i++; continue; }
    if(c==='"'){ q=!q; continue; }
    if(c===',' && !q){ row.push(cell.trim()); cell=''; continue; }
    if((c==='\n'||c==='\r') && !q){
      if(cell || row.length){ row.push(cell.trim()); rows.push(row); row=[]; cell=''; }
      continue;
    }
    cell+=c;
  }
  if(cell || row.length){ row.push(cell.trim()); rows.push(row); }
  const headers=rows.shift()?.map(h=>h.trim()) || [];
  return rows.filter(r=>r.some(v=>String(v).trim() !== '')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i] || ''])));
}

function escapeHTML(value){
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function getVal(p, ...keys){
  for(const k of keys){
    if(p && p[k] !== undefined && String(p[k]).trim() !== '') return String(p[k]).trim();
  }
  return '';
}

function loadBackendJSONP(action, params = {}){
  return new Promise((resolve, reject) => {
    const callbackName = `pranavamCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let script;
    const cleanup = () => {
      if(script && script.parentNode) script.parentNode.removeChild(script);
      try{ delete window[callbackName]; }catch(e){ window[callbackName] = undefined; }
    };

    try{
      const url = new URL(CONFIG.APPS_SCRIPT_URL);
      url.searchParams.set('action', action);
      url.searchParams.set('callback', callbackName);
      Object.entries(params || {}).forEach(([key, value]) => {
        if(value !== undefined && value !== null && String(value) !== '') url.searchParams.set(key, value);
      });

      window[callbackName] = data => {
        cleanup();
        resolve(data);
      };

      script = document.createElement('script');
      script.src = url.toString();
      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('Content request failed'));
      };
      document.head.appendChild(script);

      setTimeout(() => {
        if(window[callbackName]){
          cleanup();
          reject(new Error('Content request timed out'));
        }
      }, 12000);
    }catch(err){
      cleanup();
      reject(err);
    }
  });
}

async function loadRowsFromBackend(action, fallbackRows = [], params = {}){
  if(CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){
    try{
      const json = await loadBackendJSONP(action, params);
      if(json && json.ok && Array.isArray(json.data)) return json.data;
      console.warn(`${action} content returned no usable data. Showing default content.`, json);
    }catch(e){
      console.warn(`${action} content loading failed. Showing default content.`, e);
    }
  }

  return fallbackRows;
}



async function loadHeroSlider(){
  const slider = document.querySelector('[data-slider-page]');
  if(!slider) return;
  const page = slider.dataset.sliderPage || 'home';
  const fallback = fallbackSliderBanners();
  let rows = await loadRowsFromBackend('sliderBanners', fallback, {page});

  rows = rows
    .filter(row => {
      const status = (getVal(row,'Status') || 'Active').toLowerCase();
      const rowPage = (getVal(row,'Page','Screen') || 'home').toLowerCase();
      return status === 'active' && (rowPage === page.toLowerCase() || rowPage === 'all');
    })
    .sort((a,b) => Number(getVal(a,'SortOrder','Order') || 999) - Number(getVal(b,'SortOrder','Order') || 999));

  if(!rows.length) rows = fallback;

  const track = slider.querySelector('[data-slider-track]');
  const dots = slider.querySelector('[data-slider-dots]');
  if(!track) return;

  track.innerHTML = rows.map((row, index) => sliderSlideHTML(row, index)).join('');
  if(dots) dots.innerHTML = rows.map((_, index) => `<button type="button" class="hero-dot ${index===0?'active':''}" data-slider-dot="${index}" aria-label="Show banner ${index+1}"></button>`).join('');

  initSlider(slider, rows.length);
}

function sliderSlideHTML(row, index){
  const badge = getVal(row,'Badge','Label') || 'Pranavam Academy';
  const title = getVal(row,'Title','Heading') || 'Pranavam Academy';
  const subtitle = getVal(row,'Subtitle','Description','Text') || 'Where Passion Meets Purpose.';
  const image = getVal(row,'ImageURL','ImageUrl','URL','Src') || 'assets/images/hero-academy.jpg';
  const alt = getVal(row,'AltText','Alt') || title;
  const buttonText = getVal(row,'ButtonText','PrimaryButtonText') || 'Register Now';
  const buttonLink = getVal(row,'ButtonLink','PrimaryButtonLink') || 'register.html';
  const secondText = getVal(row,'SecondaryButtonText','SecondButtonText') || '';
  const secondLink = getVal(row,'SecondaryButtonLink','SecondButtonLink') || '#';
  return `<article class="hero-slide ${index===0?'is-active':''}" data-slide="${index}">
    <div class="container hero-grid hero-slide-grid">
      <div class="hero-copy">
        <span class="badge">${escapeHTML(badge)}</span>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(subtitle)}</p>
        <div class="btns">
          ${buttonText ? `<a class="btn btn-white" href="${escapeHTML(buttonLink)}">${escapeHTML(buttonText)}</a>` : ''}
          ${secondText ? `<a class="btn btn-outline" href="${escapeHTML(secondLink)}">${escapeHTML(secondText)}</a>` : ''}
        </div>
      </div>
      <div class="hero-img"><img alt="${escapeHTML(alt)}" decoding="async" fetchpriority="${index===0?'high':'auto'}" loading="${index===0?'eager':'lazy'}" src="${escapeHTML(image)}"/></div>
    </div>
  </article>`;
}

function initSlider(slider, count){
  if(count <= 1){
    slider.querySelector('.hero-controls')?.classList.add('hidden');
    return;
  }
  const slides = [...slider.querySelectorAll('[data-slide]')];
  const dots = [...slider.querySelectorAll('[data-slider-dot]')];
  const prev = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  let current = 0;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };

  const restart = () => {
    if(sliderTimer) clearInterval(sliderTimer);
    sliderTimer = setInterval(() => show(current + 1), 5500);
  };

  prev?.addEventListener('click', () => { show(current - 1); restart(); });
  next?.addEventListener('click', () => { show(current + 1); restart(); });
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.sliderDot || 0)); restart(); }));
  slider.addEventListener('mouseenter', () => sliderTimer && clearInterval(sliderTimer));
  slider.addEventListener('mouseleave', restart);
  restart();
}

function fallbackSliderBanners(){
  return [
    {Page:'home', SortOrder:'1', Badge:'Online & Offline Programs', Title:'Pranavam Academy', Subtitle:'Where Passion Meets Purpose. Learn Yoga, Karate, Dance, Music and Drawing through professional online and offline programs.', ImageURL:'assets/images/hero-academy.jpg', AltText:'Pranavam Academy online and offline programs', ButtonText:'Register Now', ButtonLink:'register.html', SecondaryButtonText:'View Packages', SecondaryButtonLink:'packages.html', Status:'Active'},
    {Page:'home', SortOrder:'2', Badge:'Yoga Accessible to All', Title:'Donation-Based Online Yoga', Subtitle:'Join online group yoga classes and contribute any amount you wish. No minimum or suggested donation.', ImageURL:'assets/images/yoga-accessible.jpg', AltText:'Yoga accessible to all at Pranavam Academy', ButtonText:'Explore Yoga', ButtonLink:'yoga.html', SecondaryButtonText:'Register', SecondaryButtonLink:'register.html', Status:'Active'},
    {Page:'home', SortOrder:'3', Badge:'Teach With Us', Title:'Join Pranavam as a Teacher', Subtitle:'Qualified teachers can join our mission to expand wellness, discipline, creativity and learning.', ImageURL:'assets/images/teach-with-us.jpg', AltText:'Teacher guiding students at Pranavam Academy', ButtonText:'Apply Now', ButtonLink:'become-a-teacher.html', SecondaryButtonText:'Main Programs', SecondaryButtonLink:'#main-programs', Status:'Active'}
  ];
}

async function loadSiteImages(){
  const imageTargets = document.querySelectorAll('[data-image-key], [data-bg-image-key]');
  if(!imageTargets.length) return;
  const rows = await loadRowsFromBackend('siteImages', []);

  const activeImages = new Map();
  rows.forEach(row => {
    const key = getVal(row,'ImageKey','Key','SectionKey');
    const src = getVal(row,'ImageURL','ImageUrl','URL','Url','Src');
    const status = (getVal(row,'Status') || 'Active').toLowerCase();
    if(key && src && status === 'active') activeImages.set(key, row);
  });

  document.querySelectorAll('[data-image-key]').forEach(img => {
    const row = activeImages.get(img.dataset.imageKey);
    if(!row) return;
    const src = getVal(row,'ImageURL','ImageUrl','URL','Url','Src');
    const alt = getVal(row,'AltText','Alt','Title');
    if(src) img.src = src;
    if(alt) img.alt = alt;
  });

  document.querySelectorAll('[data-bg-image-key]').forEach(el => {
    const row = activeImages.get(el.dataset.bgImageKey);
    if(!row) return;
    const src = getVal(row,'ImageURL','ImageUrl','URL','Url','Src');
    if(src) el.style.backgroundImage = `url('${src}')`;
  });
}

async function loadPackages(){
  const target=document.querySelector('#packagesGrid');
  if(!target) return;
  let data = await loadRowsFromBackend('packages', fallbackPackages());
  data = data.filter(p => (getVal(p,'Status') || 'Active').toLowerCase() === 'active');
  if(!data.length) data = fallbackPackages();
  target.innerHTML=data.map(packageCard).join('') || '<p>No active packages found.</p>';
  setupFilters(data);
}


function cleanCategory(p){
  const mode=getVal(p,'Mode');
  const category=getVal(p,'Category','Program');
  if(!mode) return category || 'Package';
  if(category.toLowerCase().startsWith(mode.toLowerCase())) return category;
  return `${mode} ${category}`.trim();
}

function displayPrice(p){
  const raw=getVal(p,'Price','Fee','Amount','PackageFee','MonthlyFee','Package Fee');
  if(!raw) return 'Contact for Fee';
  if(raw.toLowerCase().includes('donation')) return 'Donation-Based';
  return raw;
}

function slugify(value){
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'package';
}

function fieldLabel(key){
  return key
    .replace(/_/g,' ')
    .replace(/([a-z])([A-Z])/g,'$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function packageFeatures(p){
  const features = getVal(p,'Features','Includes','PackageDetails','Details','Benefits');
  if(features){
    return features.split('|').map(x=>x.trim()).filter(Boolean);
  }
  return [];
}

function packageDetails(p){
  const hidden = new Set(['Status','PackageName','Name','ClassName','Price','Fee','Amount','PackageFee','Package Fee','Description','ShortDescription','Features','Includes','PackageDetails','Details','Benefits']);
  const ordered = ['PackageID','Mode','Category','Program','ClassType','Duration','Frequency','Sessions','ClassTime','Timing','BatchDays','Batch Days','Level','AgeGroup','Age Group','Instructor','Location','AdmissionFee','Admission Fee','MonthlyFee','Monthly Fee','ReferralDiscount','Referral Discount','TrialAvailable','Trial Available','Notes'];
  const rows=[];
  const used=new Set();
  ordered.forEach(k=>{
    if(p[k] !== undefined && String(p[k]).trim() !== '' && !hidden.has(k)){
      rows.push([fieldLabel(k), String(p[k]).trim()]); used.add(k);
    }
  });
  Object.keys(p).forEach(k=>{
    if(!used.has(k) && !hidden.has(k) && String(p[k]).trim() !== '') rows.push([fieldLabel(k), String(p[k]).trim()]);
  });
  return rows;
}

function packageCard(p){
  const name=getVal(p,'PackageName','Name','ClassName') || 'Package';
  const packageId=getVal(p,'PackageID') || slugify(name);
  const mode=getVal(p,'Mode');
  const category=cleanCategory(p);
  const price=displayPrice(p);
  const desc=getVal(p,'Description','ShortDescription') || '';
  const features=packageFeatures(p);
  const details=packageDetails(p);
  const donationNote = price.toLowerCase().includes('donation')
    ? '<p class="donation-note">Contribute any amount you wish. No minimum or suggested donation.</p>'
    : '';
  return `<article class="package-card package-card-detailed" id="${escapeHTML(slugify(packageId || name))}" data-package-name="${escapeHTML(name)}" data-package-id="${escapeHTML(packageId)}" data-mode="${escapeHTML(mode)}" data-category="${escapeHTML(category)}">
    <span class="pill">${escapeHTML(category)}</span>
    <h3>${escapeHTML(name)}</h3>
    <div class="price">${escapeHTML(price)}</div>
    ${desc ? `<p>${escapeHTML(desc)}</p>` : ''}
    ${donationNote}
    ${features.length ? `<div class="detail-block"><strong>Includes</strong><ul class="package-list">${features.map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul></div>` : ''}
    ${details.length ? `<div class="package-details">${details.map(([k,v])=>`<div><span>${escapeHTML(k)}</span><strong>${escapeHTML(v)}</strong></div>`).join('')}</div>` : ''}
    <a class="btn btn-green" href="${packageActionLink(name, category)}">${packageActionText(name, category)}</a>
  </article>`;
}

function packageActionLink(name, category){
  const text = `${name} ${category}`.toLowerCase();
  if(text.includes('corporate') && text.includes('chair yoga')){
    const target = text.includes('free trial') || text.includes('trial') ? 'corporate-enquiry' : 'corporate-registration';
    return `corporate-chair-yoga.html?package=${encodeURIComponent(name)}#${target}`;
  }
  return `register.html?package=${encodeURIComponent(name)}`;
}

function packageActionText(name, category){
  const text = `${name} ${category}`.toLowerCase();
  if(text.includes('corporate') && text.includes('chair yoga')){
    return text.includes('free trial') || text.includes('trial') ? 'Book Free Trial' : 'Register Corporate Package';
  }
  return 'Register';
}

function setupFilters(data){
  const bar=document.querySelector('#packageFilters'); if(!bar) return;
  const preferred=['All','Online Yoga','Online Corporate Chair Yoga','Online Karate','Online Dance','Online Music','Online Drawing','Offline Yoga','Offline Karate','Offline Dance','Offline Music','Offline Drawing'];
  const actual=[...new Set(data.map(cleanCategory).filter(Boolean))];
  const cats=['All',...preferred.filter(c=>c!=='All'&&actual.includes(c)),...actual.filter(c=>!preferred.includes(c))];
  bar.innerHTML=cats.map((c,i)=>`<button class="filter-btn ${i===0?'active':''}" data-filter="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('');

  const cards=[...document.querySelectorAll('.package-card')];
  const note=document.querySelector('#packageFilterNote');

  const findCategory = value => actual.find(c => c.toLowerCase() === String(value || '').toLowerCase()) || String(value || 'All');

  const applyFilter = filter => {
    const normalized = String(filter || 'All');
    bar.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.filter === normalized || (normalized === 'All' && b.dataset.filter === 'All')));
    cards.forEach(card=>card.style.display=(normalized==='All'||card.dataset.category===normalized)?'block':'none');
    if(note){
      if(normalized && normalized !== 'All'){
        note.textContent = `Showing ${normalized} packages`;
        note.classList.add('show');
      } else {
        note.textContent = '';
        note.classList.remove('show');
      }
    }
  };

  bar.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>applyFilter(btn.dataset.filter)));

  const params = new URLSearchParams(location.search);
  const requestedCategory = params.get('category');
  const requestedProgram = params.get('program') || params.get('packageGroup');
  const requestedPackage = params.get('package');

  const applyProgramFilter = value => {
    const query = String(value || '').toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    bar.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    cards.forEach(card => {
      const haystack = `${card.dataset.packageName || ''} ${card.dataset.category || ''}`.toLowerCase();
      const match = words.every(w => haystack.includes(w));
      card.style.display = match ? 'block' : 'none';
    });
    if(note){
      note.textContent = `Showing packages for ${value}`;
      note.classList.add('show');
    }
  };

  if(requestedProgram){
    applyProgramFilter(requestedProgram);
    setTimeout(()=>document.querySelector('#packagesGrid')?.scrollIntoView({behavior:'smooth', block:'start'}), 150);
  } else if(requestedCategory){
    applyFilter(findCategory(requestedCategory));
    setTimeout(()=>document.querySelector('#packagesGrid')?.scrollIntoView({behavior:'smooth', block:'start'}), 150);
  } else {
    applyFilter('All');
  }

  if(requestedPackage){
    const target = cards.find(card => (card.dataset.packageName || '').toLowerCase() === requestedPackage.toLowerCase() || (card.dataset.packageId || '').toLowerCase() === requestedPackage.toLowerCase());
    if(target){
      target.scrollIntoView({behavior:'smooth', block:'center'});
      target.classList.add('package-card-highlight');
      setTimeout(()=>target.classList.remove('package-card-highlight'), 2600);
    }
  }
}

async function loadPackageSelects(){
  const selects=[...document.querySelectorAll('[data-package-select]')];
  if(!selects.length) return;

  let data = await loadRowsFromBackend('packages', fallbackPackages());
  data = data.filter(p => (getVal(p,'Status') || 'Active').toLowerCase() === 'active');
  if(!data.length) data = fallbackPackages();

  selects.forEach(select => populatePackageSelect(select, data));
}

function packageSearchText(p){
  return [
    getVal(p,'PackageID'),
    getVal(p,'Mode'),
    getVal(p,'Category','Program'),
    getVal(p,'PackageName','Name','ClassName'),
    getVal(p,'Description','ShortDescription'),
    getVal(p,'Features','Includes','PackageDetails','Details','Benefits')
  ].join(' ').toLowerCase();
}

function packageMatchesFilter(p, filterText){
  const words = String(filterText || '').toLowerCase().split(/\s+/).filter(Boolean);
  if(!words.length) return true;
  const haystack = packageSearchText(p);
  return words.every(word => haystack.includes(word));
}

function populatePackageSelect(select, allPackages){
  const filter = select.dataset.packageFilter || '';
  let packages = allPackages.filter(p => packageMatchesFilter(p, filter));

  if(!packages.length && filter.toLowerCase().includes('corporate')) {
    packages = fallbackPackages().filter(p => packageMatchesFilter(p, filter));
  }

  if(!packages.length){
    select.innerHTML = '<option value="">No matching packages found</option>';
    updatePackageSummary(select, null);
    return;
  }

  select.innerHTML = '<option value="">Select package / trial</option>' + packages.map((p, index) => {
    const name = getVal(p,'PackageName','Name','ClassName') || 'Package';
    const price = displayPrice(p);
    const duration = getVal(p,'Duration') || '';
    const label = [name, price, duration].filter(Boolean).join(' - ');
    return `<option value="${escapeHTML(name)}" data-package-index="${index}">${escapeHTML(label)}</option>`;
  }).join('');

  const fill = () => {
    const selectedOption = select.options[select.selectedIndex];
    const selectedPackage = selectedOption && selectedOption.dataset.packageIndex !== undefined
      ? packages[Number(selectedOption.dataset.packageIndex)]
      : null;
    applyPackageToForm(select, selectedPackage);
    updatePackageSummary(select, selectedPackage);
  };

  select.addEventListener('change', fill);

  const params = new URLSearchParams(location.search);
  const requestedPackage = params.get('package');
  if(requestedPackage){
    const matching = [...select.options].find(opt => opt.value.toLowerCase() === requestedPackage.toLowerCase());
    if(matching) select.value = matching.value;
  }
  fill();
}

function applyPackageToForm(select, p){
  const form = select.closest('form');
  if(!form) return;

  const setField = (name, value) => {
    const field = form.querySelector(`[name="${name}"]`);
    if(field) field.value = value || '';
  };

  if(!p){
    ['PackageID','PackageFee','PackageDuration','PackageFrequency','PackageSessions','Mode','Category'].forEach(name => setField(name, ''));
    return;
  }

  setField('PackageID', getVal(p,'PackageID'));
  setField('PackageName', getVal(p,'PackageName','Name','ClassName'));
  setField('PackageFee', displayPrice(p));
  setField('PackageDuration', getVal(p,'Duration'));
  setField('PackageFrequency', getVal(p,'Frequency'));
  setField('PackageSessions', getVal(p,'Sessions'));
  setField('Mode', getVal(p,'Mode'));
  setField('Category', getVal(p,'Category','Program'));
}

function updatePackageSummary(select, p){
  const summarySelector = select.dataset.packageSummary;
  const summary = summarySelector ? document.querySelector(summarySelector) : null;
  if(!summary) return;

  if(!p){
    summary.innerHTML = 'Select a corporate package or free trial to view duration, frequency and fee details.';
    return;
  }

  const name = getVal(p,'PackageName','Name','ClassName') || 'Selected package';
  const details = [
    ['Fee', displayPrice(p)],
    ['Duration', getVal(p,'Duration')],
    ['Frequency', getVal(p,'Frequency')],
    ['Sessions', getVal(p,'Sessions')],
    ['Trial', getVal(p,'TrialAvailable')]
  ].filter(([,value]) => value);
  const desc = getVal(p,'Description','ShortDescription');
  const features = packageFeatures(p);

  summary.innerHTML = `<strong>${escapeHTML(name)}</strong>`
    + `<div class="package-choice-meta">${details.map(([k,v])=>`<span>${escapeHTML(k)}: <b>${escapeHTML(v)}</b></span>`).join('')}</div>`
    + (desc ? `<p>${escapeHTML(desc)}</p>` : '')
    + (features.length ? `<ul>${features.map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '');
}

function fallbackPackages(){return [
 {"PackageID":"PKG001","Mode":"Online","Category":"Yoga","PackageName":"Online Group Yoga - Free Trial","Price":"Free","Duration":"1 Month","Frequency":"5 days/week","Sessions":"Up to 20 live sessions","ClassTime":"Morning / Evening Batch","Location":"Online","Features":"Beginner friendly|Live guided practice|Breathing and relaxation|Donation-based continuation","Description":"One-month free online group yoga trial for new students.","ReferralDiscount":"Not applicable","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG002","Mode":"Online","Category":"Yoga","PackageName":"Online Group Yoga - Donation Based","Price":"Voluntary Donation","Duration":"Monthly","Frequency":"5 days/week","Sessions":"Up to 20 live sessions","ClassTime":"Morning / Evening Batch","Location":"Online","Features":"No compulsory fee|Students may contribute any amount|Part of revenue supports charity and yoga promotion","Description":"Accessible online group yoga with voluntary contribution only.","ReferralDiscount":"Not applicable","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG003","Mode":"Online","Category":"Yoga","PackageName":"Online Therapeutic Yoga - Basic","Price":"₹2,500 / $35","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 live sessions","ClassTime":"By appointment","Location":"Online","Features":"Gentle asanas|Breathing practice|Relaxation|Individual attention","Description":"Gentle therapeutic yoga support for flexibility, stress relief and wellbeing.","ReferralDiscount":"5% for referred student","TrialAvailable":"No","Status":"Active"},
 {"PackageID":"PKG004","Mode":"Online","Category":"Yoga","PackageName":"Online Therapeutic Yoga - Standard","Price":"₹4,000 / $55","Duration":"Monthly","Frequency":"3 days/week","Sessions":"12 live sessions","ClassTime":"By appointment","Location":"Online","Features":"Personalized practice|Posture support|Relaxation|Progress guidance","Description":"Standard therapeutic yoga plan with more frequent guidance.","ReferralDiscount":"5% for referred student","TrialAvailable":"No","Status":"Active"},
 {"PackageID":"PKG005","Mode":"Online","Category":"Yoga","PackageName":"Online Therapeutic Yoga - 3 Months","Price":"₹10,800 / $150","Duration":"3 Months","Frequency":"3 days/week","Sessions":"36 live sessions","ClassTime":"By appointment","Location":"Online","Features":"Personalized practice|Progress review|Breathing and relaxation|Consistency support","Description":"Three-month therapeutic yoga package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"No","Status":"Active"},
 {"PackageID":"PKG006","Mode":"Online","Category":"Yoga","PackageName":"Online Therapeutic Yoga - 6 Months","Price":"₹20,400 / $285","Duration":"6 Months","Frequency":"3 days/week","Sessions":"72 live sessions","ClassTime":"By appointment","Location":"Online","Features":"Personalized practice|Progress review|Breathing and relaxation|Long-term support","Description":"Six-month therapeutic yoga package for steady progress.","ReferralDiscount":"10% for referred student","TrialAvailable":"No","Status":"Active"},
 {"PackageID":"PKG-CORP-TRIAL","Mode":"Online","Category":"Corporate Chair Yoga","PackageName":"Corporate Chair Yoga - Free Trial","Price":"Free","Duration":"1 Month","Frequency":"Flexible","Sessions":"15-minute online trial sessions","ClassTime":"Office-friendly timing","Location":"Online","Features":"Free trial for companies|15-minute chair yoga|Stress relief|No costume change needed|Employee wellness","Description":"Free one-month corporate chair yoga trial for companies and teams.","ReferralDiscount":"Not applicable","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG-CORP-001","Mode":"Online","Category":"Corporate Chair Yoga","PackageName":"Corporate Chair Yoga - 1 Month","Price":"₹7,500 / $99","Duration":"1 Month","Frequency":"5 days/week","Sessions":"20 short sessions","ClassTime":"Before work / Lunch / Evening","Location":"Online","Features":"Up to 50 employees|15-minute sessions|Desk-friendly stretches|Breathing and focus|Monthly wellness start","Description":"One-month online chair yoga package for companies starting employee wellness sessions.","ReferralDiscount":"5% for referred company","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG-CORP-003","Mode":"Online","Category":"Corporate Chair Yoga","PackageName":"Corporate Chair Yoga - 3 Months","Price":"₹21,000 / $279","Duration":"3 Months","Frequency":"5 days/week","Sessions":"60 short sessions","ClassTime":"Before work / Lunch / Evening","Location":"Online","Features":"Up to 50 employees|15-minute sessions|Stress relief|Posture support|Quarterly consistency plan","Description":"Three-month online chair yoga package for consistent employee wellness practice.","ReferralDiscount":"7% for referred company","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG-CORP-006","Mode":"Online","Category":"Corporate Chair Yoga","PackageName":"Corporate Chair Yoga - 6 Months","Price":"₹39,000 / $499","Duration":"6 Months","Frequency":"5 days/week","Sessions":"120 short sessions","ClassTime":"Before work / Lunch / Evening","Location":"Online","Features":"Up to 50 employees|15-minute sessions|Breathing and stretching|Monthly progress review|Long-term wellness support","Description":"Six-month online chair yoga package for companies planning a sustained wellness program.","ReferralDiscount":"10% for referred company","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG-CORP-012","Mode":"Online","Category":"Corporate Chair Yoga","PackageName":"Corporate Chair Yoga - 12 Months","Price":"₹72,000 / $899","Duration":"12 Months","Frequency":"5 days/week","Sessions":"240 short sessions","ClassTime":"Before work / Lunch / Evening","Location":"Online","Features":"Up to 50 employees|15-minute sessions|Annual employee wellness plan|Priority scheduling|Best value package","Description":"Annual online chair yoga package for companies that want a full-year employee wellness routine.","ReferralDiscount":"10% for referred company","TrialAvailable":"Yes","Status":"Active"},
 {"PackageID":"PKG011","Mode":"Online","Category":"Karate","PackageName":"Online Karate - Monthly","Price":"₹1,200 / $20","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 live sessions","ClassTime":"Evening Batch","Location":"Online","Features":"Basics and stances|Fitness drills|Discipline|Confidence building","Description":"Online karate training for beginners and regular students.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG012","Mode":"Online","Category":"Karate","PackageName":"Online Karate - 3 Months","Price":"₹3,300 / $55","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 live sessions","ClassTime":"Evening Batch","Location":"Online","Features":"Basics and stances|Fitness drills|Discipline|Confidence building","Description":"Three-month online karate package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG013","Mode":"Online","Category":"Karate","PackageName":"Online Karate - 6 Months","Price":"₹6,000 / $100","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 live sessions","ClassTime":"Evening Batch","Location":"Online","Features":"Basics and stances|Fitness drills|Discipline|Confidence building","Description":"Six-month online karate package for continuous training.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG014","Mode":"Online","Category":"Karate","PackageName":"Online Karate - 12 Months","Price":"₹11,000 / $180","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 live sessions","ClassTime":"Evening Batch","Location":"Online","Features":"Basics and stances|Fitness drills|Discipline|Confidence building","Description":"Annual online karate package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG015","Mode":"Online","Category":"Dance","PackageName":"Online Dance - Monthly","Price":"₹1,200 / $20","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Description":"Online dance class for rhythm, movement and confidence.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG016","Mode":"Online","Category":"Dance","PackageName":"Online Dance - 3 Months","Price":"₹3,300 / $55","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Description":"Three-month online dance package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG017","Mode":"Online","Category":"Dance","PackageName":"Online Dance - 6 Months","Price":"₹6,000 / $100","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Description":"Six-month online dance package for steady learning.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG018","Mode":"Online","Category":"Dance","PackageName":"Online Dance - 12 Months","Price":"₹11,000 / $180","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Description":"Annual online dance package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG019","Mode":"Online","Category":"Music","PackageName":"Online Music - Group Monthly","Price":"₹1,500 / $25","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Description":"Online group music class for beginners and regular learners.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG020","Mode":"Online","Category":"Music","PackageName":"Online Music - Individual Monthly","Price":"₹3,000 / $45","Duration":"Monthly","Frequency":"1 day/week","Sessions":"4 personal sessions","ClassTime":"By appointment","Location":"Online","Features":"One-to-one guidance|Personal practice plan|Voice or instrument support|Progress feedback","Description":"Individual online music coaching package.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG021","Mode":"Online","Category":"Music","PackageName":"Online Music - 3 Months Group","Price":"₹4,200 / $70","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Description":"Three-month online group music package.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG022","Mode":"Online","Category":"Music","PackageName":"Online Music - 6 Months Group","Price":"₹8,000 / $130","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Description":"Six-month online group music package.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG023","Mode":"Online","Category":"Drawing","PackageName":"Online Drawing - Monthly","Price":"₹800 / $15","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Sketching basics|Color practice|Creative projects|Step-by-step guidance","Description":"Online drawing and creative art class for children and beginners.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG024","Mode":"Online","Category":"Drawing","PackageName":"Online Drawing - 3 Months","Price":"₹2,200 / $40","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Sketching basics|Color practice|Creative projects|Step-by-step guidance","Description":"Three-month online drawing package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG025","Mode":"Online","Category":"Drawing","PackageName":"Online Drawing - 6 Months","Price":"₹4,000 / $70","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Sketching basics|Color practice|Creative projects|Step-by-step guidance","Description":"Six-month online drawing package for steady improvement.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG026","Mode":"Online","Category":"Drawing","PackageName":"Online Drawing - 12 Months","Price":"₹7,500 / $125","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 live sessions","ClassTime":"Evening / Weekend Batch","Location":"Online","Features":"Sketching basics|Color practice|Creative projects|Step-by-step guidance","Description":"Annual online drawing package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG027","Mode":"Offline","Category":"Yoga","PackageName":"Offline Yoga - Monthly","Price":"₹1,000","Duration":"Monthly","Frequency":"3 days/week","Sessions":"12 studio sessions","ClassTime":"Morning / Evening Batch","Location":"Pranavam Academy","Features":"Asanas|Pranayama|Meditation|In-person correction","Description":"Regular offline yoga class at Pranavam Academy.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG028","Mode":"Offline","Category":"Yoga","PackageName":"Offline Yoga - 3 Months","Price":"₹2,700","Duration":"3 Months","Frequency":"3 days/week","Sessions":"36 studio sessions","ClassTime":"Morning / Evening Batch","Location":"Pranavam Academy","Features":"Asanas|Pranayama|Meditation|In-person correction","Description":"Three-month offline yoga package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG029","Mode":"Offline","Category":"Yoga","PackageName":"Offline Yoga - 6 Months","Price":"₹5,000","Duration":"6 Months","Frequency":"3 days/week","Sessions":"72 studio sessions","ClassTime":"Morning / Evening Batch","Location":"Pranavam Academy","Features":"Asanas|Pranayama|Meditation|In-person correction","Description":"Six-month offline yoga package for consistent practice.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG030","Mode":"Offline","Category":"Yoga","PackageName":"Offline Yoga - 12 Months","Price":"₹9,000","Duration":"12 Months","Frequency":"3 days/week","Sessions":"144 studio sessions","ClassTime":"Morning / Evening Batch","Location":"Pranavam Academy","Features":"Asanas|Pranayama|Meditation|In-person correction","Description":"Annual offline yoga package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG031","Mode":"Offline","Category":"Karate","PackageName":"Offline Karate - Monthly","Price":"₹800","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Karate basics|Fitness|Discipline|Self-defense","Description":"Offline karate training for children and regular learners.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG032","Mode":"Offline","Category":"Karate","PackageName":"Offline Karate - 3 Months","Price":"₹2,200","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Karate basics|Fitness|Discipline|Self-defense","Description":"Three-month offline karate package with discounted fee.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG033","Mode":"Offline","Category":"Karate","PackageName":"Offline Karate - 6 Months","Price":"₹4,200","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Karate basics|Fitness|Discipline|Self-defense","Description":"Six-month offline karate package.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG034","Mode":"Offline","Category":"Karate","PackageName":"Offline Karate - 12 Months","Price":"₹7,500","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Karate basics|Fitness|Discipline|Self-defense","Description":"Annual offline karate package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG035","Mode":"Offline","Category":"Dance","PackageName":"Offline Dance - Monthly","Price":"₹1,000","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Dance basics|Rhythm|Choreography practice|Stage confidence","Description":"Offline dance class for children and regular learners.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG036","Mode":"Offline","Category":"Dance","PackageName":"Offline Dance - 3 Months","Price":"₹2,700","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Dance basics|Rhythm|Choreography practice|Stage confidence","Description":"Three-month offline dance package.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG037","Mode":"Offline","Category":"Dance","PackageName":"Offline Dance - 6 Months","Price":"₹5,000","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Dance basics|Rhythm|Choreography practice|Stage confidence","Description":"Six-month offline dance package.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG038","Mode":"Offline","Category":"Dance","PackageName":"Offline Dance - 12 Months","Price":"₹9,000","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Dance basics|Rhythm|Choreography practice|Stage confidence","Description":"Annual offline dance package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG039","Mode":"Offline","Category":"Music","PackageName":"Offline Music - Group Monthly","Price":"₹1,500","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Voice or instrument guidance|Music basics|Practice support|Progress review","Description":"Offline music class at Pranavam Academy.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG040","Mode":"Offline","Category":"Music","PackageName":"Offline Music - Individual Monthly","Price":"₹3,000","Duration":"Monthly","Frequency":"1 day/week","Sessions":"4 personal sessions","ClassTime":"By appointment","Location":"Pranavam Academy","Features":"One-to-one guidance|Personal practice plan|Progress feedback|Voice or instrument support","Description":"Individual offline music coaching package.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG041","Mode":"Offline","Category":"Music","PackageName":"Offline Music - 3 Months Group","Price":"₹4,200","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Voice or instrument guidance|Music basics|Practice support|Progress review","Description":"Three-month offline group music package.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG042","Mode":"Offline","Category":"Music","PackageName":"Offline Music - 6 Months Group","Price":"₹8,000","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Voice or instrument guidance|Music basics|Practice support|Progress review","Description":"Six-month offline group music package.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG043","Mode":"Offline","Category":"Drawing","PackageName":"Offline Drawing - Monthly","Price":"₹600","Duration":"Monthly","Frequency":"2 days/week","Sessions":"8 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Sketching basics|Coloring|Creative projects|Teacher guidance","Description":"Offline drawing and creative art class for children.","ReferralDiscount":"5% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG044","Mode":"Offline","Category":"Drawing","PackageName":"Offline Drawing - 3 Months","Price":"₹1,600","Duration":"3 Months","Frequency":"2 days/week","Sessions":"24 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Sketching basics|Coloring|Creative projects|Teacher guidance","Description":"Three-month offline drawing package.","ReferralDiscount":"7% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG045","Mode":"Offline","Category":"Drawing","PackageName":"Offline Drawing - 6 Months","Price":"₹3,000","Duration":"6 Months","Frequency":"2 days/week","Sessions":"48 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Sketching basics|Coloring|Creative projects|Teacher guidance","Description":"Six-month offline drawing package.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"},
 {"PackageID":"PKG046","Mode":"Offline","Category":"Drawing","PackageName":"Offline Drawing - 12 Months","Price":"₹5,500","Duration":"12 Months","Frequency":"2 days/week","Sessions":"96 studio sessions","ClassTime":"Evening / Weekend Batch","Location":"Pranavam Academy","Features":"Sketching basics|Coloring|Creative projects|Teacher guidance","Description":"Annual offline drawing package with maximum savings.","ReferralDiscount":"10% for referred student","TrialAvailable":"Trial class","Status":"Active"}
]}


function prefillFormsFromURL(){
  const params = new URLSearchParams(location.search);
  const values = {
    Program: params.get('program') || '',
    PackageName: params.get('package') || '',
    Mode: params.get('mode') || '',
    Category: params.get('category') || ''
  };
  Object.entries(values).forEach(([name, value]) => {
    if(!value) return;
    document.querySelectorAll(`form [name="${name}"]`).forEach(field => {
      if(field.matches('select')){
        const option=[...field.options].find(opt => opt.value.toLowerCase() === value.toLowerCase() || opt.textContent.toLowerCase() === value.toLowerCase());
        if(option) field.value = option.value;
      } else if(!field.value) {
        field.value = value;
      }
    });
  });
}

function handleForms(){
 document.querySelectorAll('form[data-sheet]').forEach(form=>form.addEventListener('submit',async e=>{
  e.preventDefault(); const msg=form.querySelector('.form-message'); const payload=Object.fromEntries(new FormData(form).entries()); payload.sheet=form.dataset.sheet; payload.Page=location.pathname.split('/').pop() || 'index.html';
  if(!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){ if(msg) msg.textContent='Registration is temporarily unavailable. Please contact us on WhatsApp.'; return; }
  try{ await fetch(CONFIG.APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)}); form.reset(); if(msg) msg.textContent=form.dataset.successMessage || 'Thank you. Your details have been submitted.'; }
  catch(err){ if(msg) msg.textContent='Submission failed. Please contact us on WhatsApp.'; }
 }))
}


function isAdminPage(){ return !!document.querySelector('#adminDashboard'); }

document.addEventListener('DOMContentLoaded', () => { if(isAdminPage()) initAdminDashboard(); });

function initAdminDashboard(){
  const login = document.querySelector('#adminLogin');
  const dashboard = document.querySelector('#adminDashboard');
  const form = document.querySelector('#adminLoginForm');
  const msg = form?.querySelector('.form-message');
  const saved = sessionStorage.getItem('pranavamAdminAuth') === 'yes';
  if(saved){ login?.classList.add('hidden'); dashboard?.classList.remove('hidden'); loadAdminData(); }
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.querySelector('#adminPassword')?.value || '';
    const ok = await verifyAdminPassword(password);
    if(ok){ sessionStorage.setItem('pranavamAdminAuth','yes'); login.classList.add('hidden'); dashboard.classList.remove('hidden'); loadAdminData(); }
    else if(msg){ msg.textContent = 'Incorrect password. Check Settings sheet → AdminPassword.'; }
  });
  document.querySelector('#refreshAdmin')?.addEventListener('click', loadAdminData);
  document.querySelector('#logoutAdmin')?.addEventListener('click', () => { sessionStorage.removeItem('pranavamAdminAuth'); location.reload(); });
  document.querySelectorAll('[data-admin-action]').forEach(btn => btn.addEventListener('click', () => runAdminAction(btn.dataset.adminAction)));
}

async function verifyAdminPassword(password){
  if(!password) return false;
  if(CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){
    try{
      const result = await loadBackendJSONP('adminLogin', {password});
      return !!(result && result.ok && result.authenticated);
    }catch(e){ console.warn('Admin login backend failed; using local fallback only.', e); }
  }
  return password === '12345';
}

async function loadAdminData(){
  const fallback = fallbackAdminData();
  let data = fallback;
  if(CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){
    try{
      const result = await loadBackendJSONP('adminData', {});
      if(result && result.ok && result.data) data = result.data;
    }catch(e){ console.warn('Admin data failed. Showing fallback.', e); }
  }
  renderAdminData(data);
}

function fallbackAdminData(){
  return {stats:{Registrations:0,CorporateLeads:0,CorporateRegistrations:0,TeacherApplications:0,ActivePackages:fallbackPackages().length,ActiveBanners:fallbackSliderBanners().length,ActiveImages:0,Payments:0},registrations:[],corporateLeads:[],teacherApplications:[],packages:fallbackPackages().slice(0,20),banners:fallbackSliderBanners()};
}

function renderAdminData(data){
  const stats = data.stats || {};
  const statsBox = document.querySelector('#adminStats');
  if(statsBox){
    statsBox.innerHTML = Object.entries(stats).map(([k,v]) => `<div class="stat-card"><span>${escapeHTML(fieldLabel(k))}</span><strong>${escapeHTML(v)}</strong></div>`).join('');
  }
  renderTable('#registrationsTable', data.registrations || [], ['Timestamp','Name','Phone','Program','PackageName','Status']);
  renderTable('#corporateTable', data.corporateLeads || [], ['Timestamp','CompanyName','ContactPerson','Phone','PackageName','Status']);
  renderTable('#teachersTable', data.teacherApplications || [], ['Timestamp','Name','Phone','Subject','TeachingMode','Status']);
  renderTable('#packagesTable', data.packages || [], ['PackageID','Mode','Category','PackageName','Price','Duration','Status']);
  renderTable('#bannersTable', data.banners || [], ['BannerID','Page','SortOrder','Title','ButtonText','Status']);
}

function renderTable(selector, rows, headers){
  const table = document.querySelector(selector); if(!table) return;
  const limited = rows.slice(0, 50);
  table.innerHTML = `<thead><tr>${headers.map(h=>`<th>${escapeHTML(fieldLabel(h))}</th>`).join('')}</tr></thead><tbody>` +
    (limited.length ? limited.map(row => `<tr>${headers.map(h=>`<td>${escapeHTML(getVal(row,h) || '')}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">No data available yet.</td></tr>`) + '</tbody>';
}

async function runAdminAction(action){
  const msg = document.querySelector('#adminActionMessage');
  if(msg) msg.textContent = 'Running action...';
  if(!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){
    if(msg) msg.textContent = 'Connect Apps Script URL in assets/config.js to run backend actions.';
    return;
  }
  try{
    const result = await loadBackendJSONP('adminAction', {task: action});
    if(msg) msg.textContent = result && result.message ? result.message : 'Action completed.';
    loadAdminData();
  }catch(e){ if(msg) msg.textContent = 'Action failed: ' + e.message; }
}
