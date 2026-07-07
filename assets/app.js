const DEFAULT_CONFIG = {
  // Default values. Edit only assets/config.js for normal setup.
  APPS_SCRIPT_URL: "",
  WHATSAPP_NUMBER: "918921696649"
};

const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.PRANAVAM_CONFIG || {});
CONFIG.APPS_SCRIPT_URL = String(CONFIG.APPS_SCRIPT_URL || CONFIG.WEBAPP_URL || '').trim();


let deferredInstallPrompt = null;
let sliderTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initPWA();
  loadHeroSlider();
  loadSiteImages();
  loadPackages();
  loadPackageSelects();
  handleForms();
});

function initMobileMenu(){
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('open'));
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
        reject(new Error('Backend JSONP request failed'));
      };
      document.head.appendChild(script);

      setTimeout(() => {
        if(window[callbackName]){
          cleanup();
          reject(new Error('Backend JSONP request timed out'));
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
      console.warn(`${action} backend returned no usable data. Showing default content.`, json);
    }catch(e){
      console.warn(`${action} backend loading failed. Showing default content.`, e);
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
  const category=cleanCategory(p);
  const price=displayPrice(p);
  const desc=getVal(p,'Description','ShortDescription') || '';
  const features=packageFeatures(p);
  const details=packageDetails(p);
  const donationNote = price.toLowerCase().includes('donation')
    ? '<p class="donation-note">Contribute any amount you wish. No minimum or suggested donation.</p>'
    : '';
  return `<article class="package-card package-card-detailed" data-category="${escapeHTML(category)}">
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
  if(text.includes('corporate') && text.includes('chair yoga')) return 'corporate-chair-yoga.html#corporate-enquiry';
  return `register.html?package=${encodeURIComponent(name)}`;
}

function packageActionText(name, category){
  const text = `${name} ${category}`.toLowerCase();
  if(text.includes('corporate') && text.includes('chair yoga')) return 'Book Corporate Trial';
  return 'Register';
}

function setupFilters(data){
  const bar=document.querySelector('#packageFilters'); if(!bar) return;
  const preferred=['All','Online Yoga','Online Karate','Online Dance','Online Music','Online Drawing','Offline Yoga','Offline Karate','Offline Dance','Offline Music','Offline Drawing'];
  const actual=[...new Set(data.map(cleanCategory).filter(Boolean))];
  const cats=['All',...preferred.filter(c=>c!=='All'&&actual.includes(c)),...actual.filter(c=>!preferred.includes(c))];
  bar.innerHTML=cats.map((c,i)=>`<button class="filter-btn ${i===0?'active':''}" data-filter="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('');
  bar.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
    bar.querySelectorAll('button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const f=btn.dataset.filter; document.querySelectorAll('.package-card').forEach(card=>card.style.display=(f==='All'||card.dataset.category===f)?'block':'none');
  }));
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
 {Mode:'Online',Category:'Yoga',PackageName:'Online Group Yoga Class',Price:'Donation-Based',Duration:'Monthly',Frequency:'Live group sessions',Sessions:'Regular online batch',Description:'Open online group yoga program accessible to all students.',Features:'Live online group sessions|Asana, pranayama and relaxation|Pay any amount you wish|No minimum or suggested donation'},
 {Mode:'Online',Category:'Yoga',PackageName:'Online Corporate Chair Yoga Class',Price:'Custom Package',Duration:'Monthly',Frequency:'15-minute staff sessions',Sessions:'Custom company schedule',Description:'Designed for companies, teams and employee wellness.',Features:'15-minute online sessions|Stress relief and posture support|Suitable for office staff|Custom corporate package'},
 {PackageID:'PKG-CORP-TRIAL',Mode:'Online',Category:'Corporate Chair Yoga',PackageName:'Corporate Chair Yoga - Free Trial',Price:'Free',Duration:'1 Month',Frequency:'Flexible',Sessions:'15-minute online sessions',ClassTime:'Office-friendly timing',Location:'Online',Description:'Free one-month corporate chair yoga trial for companies.',Features:'15-minute chair yoga|Stress relief|No costume change needed|Employee wellness',ReferralDiscount:'Not applicable',TrialAvailable:'Yes'},
 {PackageID:'PKG-CORP-SMALL',Mode:'Online',Category:'Corporate Chair Yoga',PackageName:'Corporate Chair Yoga - Small Team',Price:'₹7,500 / $99',Duration:'Monthly',Frequency:'5 days/week',Sessions:'20 short sessions',ClassTime:'Before work / Lunch / Evening',Location:'Online',Description:'Monthly online chair yoga package for small teams.',Features:'Up to 20 employees|15-minute sessions|Desk-friendly stretches|Breathing and focus',ReferralDiscount:'5% for referred company',TrialAvailable:'Yes'},
 {PackageID:'PKG-CORP-MEDIUM',Mode:'Online',Category:'Corporate Chair Yoga',PackageName:'Corporate Chair Yoga - Medium Team',Price:'₹15,000 / $199',Duration:'Monthly',Frequency:'5 days/week',Sessions:'20 short sessions',ClassTime:'Before work / Lunch / Evening',Location:'Online',Description:'Monthly online chair yoga package for medium teams.',Features:'Up to 50 employees|15-minute sessions|Stress relief|Attendance support',ReferralDiscount:'5% for referred company',TrialAvailable:'Yes'},
 {PackageID:'PKG-CORP-LARGE',Mode:'Online',Category:'Corporate Chair Yoga',PackageName:'Corporate Chair Yoga - Large Team',Price:'₹25,000 / $299',Duration:'Monthly',Frequency:'5 days/week',Sessions:'20 short sessions',ClassTime:'Before work / Lunch / Evening',Location:'Online',Description:'Monthly online chair yoga package for larger teams.',Features:'Up to 100 employees|15-minute sessions|Wellness theme support|Monthly summary',ReferralDiscount:'5% for referred company',TrialAvailable:'Yes'},
 {Mode:'Online',Category:'Yoga',PackageName:'Online Therapeutic Yoga',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Guided sessions',Sessions:'Personalized support',Description:'Personalized yoga support for wellbeing and flexibility.',Features:'Gentle guided yoga|Breathing and relaxation|Individual attention|Suitable for specific wellness goals'},
 {Mode:'Online',Category:'Karate',PackageName:'Online Karate Class',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular online sessions',Sessions:'Beginner and regular batch',Description:'Online karate training for discipline, fitness and confidence.',Features:'Basic techniques|Fitness drills|Discipline and confidence building'},
 {Mode:'Online',Category:'Dance',PackageName:'Online Dance Class',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular online sessions',Sessions:'Group batch',Description:'Online dance training for rhythm, movement and expression.',Features:'Step-by-step learning|Creative movement|Beginner-friendly sessions'},
 {Mode:'Online',Category:'Music',PackageName:'Online Music Class',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular online sessions',Sessions:'Group or individual options',Description:'Online music learning with guided practice.',Features:'Vocal or instrument guidance|Practice support|Beginner-friendly approach'},
 {Mode:'Online',Category:'Drawing',PackageName:'Online Drawing Class',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular online sessions',Sessions:'Creative batch',Description:'Online drawing and creative art sessions for students.',Features:'Basic drawing skills|Creative projects|Step-by-step guidance'},
 {Mode:'Offline',Category:'Yoga',PackageName:'Offline Yoga Regular Batch',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Studio classes',Sessions:'Morning or evening batches',Description:'Traditional in-person yoga classes at the academy.',Features:'Asanas and pranayama|Meditation and relaxation|In-person correction and guidance'},
 {Mode:'Offline',Category:'Karate',PackageName:'Offline Karate Training Package',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular academy batches',Sessions:'Children and regular batches',Description:'Discipline, fitness, self-confidence and self-defense.',Features:'Karate basics|Fitness and discipline|Self-defense skills'},
 {Mode:'Offline',Category:'Dance',PackageName:'Offline Dance Class Package',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular academy batches',Sessions:'Children and regular batches',Description:'Creative movement and performance skills.',Features:'Dance basics|Choreography practice|Stage confidence'},
 {Mode:'Offline',Category:'Music',PackageName:'Offline Music Class Package',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular academy batches',Sessions:'Group or individual options',Description:'Music training at the academy with guided practice.',Features:'Foundational learning|Voice or instrument support|Regular practice'},
 {Mode:'Offline',Category:'Drawing',PackageName:'Offline Drawing Class Package',Price:'Contact for Fee',Duration:'Monthly',Frequency:'Regular academy batches',Sessions:'Creative batches',Description:'Drawing and creative arts training at the academy.',Features:'Sketching basics|Color and composition|Creative projects'}
]}

function handleForms(){
 document.querySelectorAll('form[data-sheet]').forEach(form=>form.addEventListener('submit',async e=>{
  e.preventDefault(); const msg=form.querySelector('.form-message'); const payload=Object.fromEntries(new FormData(form).entries()); payload.sheet=form.dataset.sheet; payload.Page=location.pathname.split('/').pop() || 'index.html';
  if(!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){ if(msg) msg.textContent='Form is ready. Please paste the Web App URL in assets/config.js.'; return; }
  try{ await fetch(CONFIG.APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)}); form.reset(); if(msg) msg.textContent=form.dataset.successMessage || 'Thank you. Your details have been submitted.'; }
  catch(err){ if(msg) msg.textContent='Submission failed. Please contact us on WhatsApp.'; }
 }))
}
