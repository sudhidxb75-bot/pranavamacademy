(function(){
  const cfg = window.PRANAVAM_CONFIG || {};
  const API = (cfg.WEB_APP_URL || '').trim();
  const fallbackEnabled = cfg.FALLBACK_TO_STATIC_DATA !== false;
  const whatsapp = cfg.WHATSAPP_NUMBER || '918921696649';
  const shoppingUrl = cfg.SHOPPING_URL || 'https://www.freshly-online.com/freshlymart/#wellness';

  const fallbackMenu = [
    {MenuID:'M001',ParentID:'',MenuName:'Home',PageLink:'#home',SortOrder:1,Status:'Active',OpenType:'Same',Footer:'Yes'},
    {MenuID:'M002',ParentID:'',MenuName:'Online Programs',PageLink:'#online-programs',SortOrder:2,Status:'Active',OpenType:'Same',Footer:'No'},
    {MenuID:'M003',ParentID:'M002',MenuName:'Online Group Yoga',PageLink:'#online-group-yoga',SortOrder:1,Status:'Active',OpenType:'Same'},
    {MenuID:'M004',ParentID:'M002',MenuName:'Corporate Chair Yoga',PageLink:'#corporate-chair-yoga',SortOrder:2,Status:'Active',OpenType:'Same'},
    {MenuID:'M005',ParentID:'M002',MenuName:'Therapeutic Yoga',PageLink:'#therapeutic-yoga',SortOrder:3,Status:'Active',OpenType:'Same'},
    {MenuID:'M006',ParentID:'M002',MenuName:'Online Karate',PageLink:'#online-karate',SortOrder:4,Status:'Active',OpenType:'Same'},
    {MenuID:'M007',ParentID:'M002',MenuName:'Online Dance',PageLink:'#online-dance',SortOrder:5,Status:'Active',OpenType:'Same'},
    {MenuID:'M008',ParentID:'M002',MenuName:'Online Music',PageLink:'#online-music',SortOrder:6,Status:'Active',OpenType:'Same'},
    {MenuID:'M009',ParentID:'M002',MenuName:'Online Drawing',PageLink:'#online-drawing',SortOrder:7,Status:'Active',OpenType:'Same'},
    {MenuID:'M010',ParentID:'',MenuName:'Offline Programs',PageLink:'#offline-programs',SortOrder:3,Status:'Active',OpenType:'Same',Footer:'No'},
    {MenuID:'M011',ParentID:'M010',MenuName:'Yoga',PageLink:'#offline-yoga',SortOrder:1,Status:'Active',OpenType:'Same'},
    {MenuID:'M012',ParentID:'M010',MenuName:'Karate',PageLink:'#offline-karate',SortOrder:2,Status:'Active',OpenType:'Same'},
    {MenuID:'M013',ParentID:'M010',MenuName:'Dance',PageLink:'#offline-dance',SortOrder:3,Status:'Active',OpenType:'Same'},
    {MenuID:'M014',ParentID:'M010',MenuName:'Music',PageLink:'#offline-music',SortOrder:4,Status:'Active',OpenType:'Same'},
    {MenuID:'M015',ParentID:'M010',MenuName:'Drawing',PageLink:'#offline-drawing',SortOrder:5,Status:'Active',OpenType:'Same'},
    {MenuID:'M016',ParentID:'',MenuName:'Class Packages',PageLink:'#packages',SortOrder:4,Status:'Active',OpenType:'Same',Footer:'Yes'},
    {MenuID:'M017',ParentID:'',MenuName:'Register',PageLink:'#register',SortOrder:5,Status:'Active',OpenType:'Same',Footer:'Yes'},
    {MenuID:'M018',ParentID:'',MenuName:'Teach With Us',PageLink:'#teach-with-us',SortOrder:6,Status:'Active',OpenType:'Same',Footer:'Yes'},
    {MenuID:'M019',ParentID:'',MenuName:'Shopping',PageLink:'shopping',SortOrder:7,Status:'Active',OpenType:'New',Footer:'Yes'}
  ];

  const fallbackPrograms = [
    {Type:'Online',Title:'Online Group Yoga',Description:'Live group yoga sessions for health, flexibility, breathing and peace of mind.',Tag:'Donation Based',ImageURL:'assets/images/online-group-yoga.svg'},
    {Type:'Online',Title:'Corporate Chair Yoga',Description:'15-minute office-friendly online sessions for healthier and happier teams.',Tag:'1 Month Free Trial',ImageURL:'assets/images/corporate-chair-yoga-office.png'},
    {Type:'Online',Title:'Therapeutic Yoga',Description:'Personalized yoga support for stress, posture, mobility and wellness goals.',Tag:'Wellness',ImageURL:'assets/images/therapeutic-yoga.svg'},
    {Type:'Online',Title:'Online Karate',Description:'Build discipline, focus and fitness through structured online guidance.',Tag:'Online',ImageURL:'assets/images/online-karate.svg'},
    {Type:'Online',Title:'Online Dance',Description:'Learn dance from home with regular practice and teacher support.',Tag:'Online',ImageURL:'assets/images/online-dance.svg'},
    {Type:'Online',Title:'Online Music',Description:'Develop musical skill with live online class support.',Tag:'Creative',ImageURL:'assets/images/online-music.svg'},
    {Type:'Online',Title:'Online Drawing',Description:'Drawing and creativity classes for children and beginners.',Tag:'Creative',ImageURL:'assets/images/online-drawing.svg'},
    {Type:'Offline',Title:'Yoga',Description:'Regular yoga classes at Pranavam Academy for beginners and regular students.',Tag:'Health',ImageURL:'assets/images/offline-yoga.svg'},
    {Type:'Offline',Title:'Karate',Description:'Karate training for discipline, confidence, strength and self-defense.',Tag:'Fitness',ImageURL:'assets/images/offline-karate.svg'},
    {Type:'Offline',Title:'Dance',Description:'Dance classes to improve rhythm, expression, fitness and confidence.',Tag:'Arts',ImageURL:'assets/images/offline-dance.svg'},
    {Type:'Offline',Title:'Music',Description:'Music learning for students who want to develop skill and expression.',Tag:'Arts',ImageURL:'assets/images/offline-music.svg'},
    {Type:'Offline',Title:'Drawing',Description:'Drawing classes to improve creativity, observation and artistic skill.',Tag:'Creative',ImageURL:'assets/images/offline-drawing.svg'}
  ];

  const fallbackPackages = [
    {Title:'Online Group Yoga',Duration:'1 / 3 / 6 / 12 Months',Price:'Donation Based',Description:'No compulsory fee. Students may contribute any amount or continue free.',ImageURL:'assets/images/online-group-yoga.svg'},
    {Title:'Corporate Chair Yoga',Duration:'1 / 3 / 6 / 12 Months',Price:'Free Trial Available',Description:'15-minute online sessions for teams and workplaces.',ImageURL:'assets/images/corporate-chair-yoga-office.png'},
    {Title:'Therapeutic Yoga',Duration:'Monthly Plan',Price:'Contact Academy',Description:'Personalized sessions based on student requirement.',ImageURL:'assets/images/therapeutic-yoga.svg'},
    {Title:'Offline Classes',Duration:'Monthly Packages',Price:'Contact Academy',Description:'Yoga, karate, dance, music and drawing at Pranavam Academy.',ImageURL:'assets/images/class-packages.svg'}
  ];


  const fallbackBanners = [
    {BannerID:'B001',Eyebrow:'Pranavam Academy',Title:'Learn Yoga, Fitness and Arts with Purpose',Subtitle:'Join online and offline programs for yoga, karate, dance, music and drawing. Beginner-friendly classes for children, adults, professionals and corporate teams.',ButtonText:'Register Now',ButtonLink:'#register',SecondButtonText:'View Packages',SecondButtonLink:'#packages',ImageURL:'assets/images/academy-banner.svg',SortOrder:1,Status:'Active'},
    {BannerID:'B002',Eyebrow:'Corporate Wellness',Title:'Corporate Online Chair Yoga',Subtitle:'15-minute live online chair yoga sessions for healthier teams, better posture, reduced stress and improved focus at work.',ButtonText:'Request Free Trial',ButtonLink:'#corporate-chair-yoga',SecondButtonText:'Enquire Now',SecondButtonLink:'#corporate-form',ImageURL:'assets/images/corporate-chair-yoga-office.png',SortOrder:2,Status:'Active'},
    {BannerID:'B003',Eyebrow:'Online Programs',Title:'Online Programs from Anywhere',Subtitle:'Online group yoga, therapeutic yoga, karate, dance, music and drawing programs controlled from the backend.',ButtonText:'Explore Online Programs',ButtonLink:'#online-programs',SecondButtonText:'Chat on WhatsApp',SecondButtonLink:'whatsapp',ImageURL:'assets/images/online-programs-banner.svg',SortOrder:3,Status:'Active'}
  ];

  function apiUrl(action){
    if(!API || API.includes('PASTE_YOUR')) return '';
    return API + (API.includes('?') ? '&' : '?') + 'action=' + encodeURIComponent(action);
  }

  async function getJson(action, fallback){
    const url = apiUrl(action);
    if(!url) return fallback;
    try{
      const res = await fetch(url, {method:'GET', cache:'no-store'});
      const json = await res.json();
      if(json && json.ok){
        if(action === 'getPublicData') return json.data || fallback;
        return json.data || fallback;
      }
    }catch(err){ console.warn('Backend unavailable:', action, err); }
    return fallbackEnabled ? fallback : [];
  }

  function active(items){
    return (items || []).filter(x => String(x.Status || 'Active').toLowerCase() === 'active')
      .sort((a,b)=>(Number(a.SortOrder)||999)-(Number(b.SortOrder)||999));
  }


  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function normalizeLink(link){
    const val = String(link || '').trim();
    if(val.toLowerCase() === 'whatsapp'){
      const waText = encodeURIComponent('Hello Pranavam Academy, I would like to know more about your programs.');
      return `https://wa.me/${whatsapp}?text=${waText}`;
    }
    if(val.toLowerCase() === 'shopping') return shoppingUrl;
    return val || '#';
  }

  function slugify(value){
    return String(value || '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  function programId(program){
    const title = program.Title || program.ProgramName || '';
    const type = String(program.Type || '').toLowerCase();
    let slug = slugify(title);
    if(type === 'offline' && !slug.startsWith('offline-')) slug = 'offline-' + slug;
    return slug || 'program';
  }

  function renderBanners(banners){
    const list = active(banners || []);
    const track = document.getElementById('bannerTrack');
    const dots = document.getElementById('bannerDots');
    if(!track || !dots) return;
    const slides = list.length ? list : fallbackBanners;
    track.innerHTML = slides.map(b => {
      const img = b.ImageURL || 'assets/images/academy-banner.svg';
      const btn1 = b.ButtonText ? `<a class="btn primary" href="${esc(normalizeLink(b.ButtonLink))}">${esc(b.ButtonText)}</a>` : '';
      const btn2 = b.SecondButtonText ? `<a class="btn outline" href="${esc(normalizeLink(b.SecondButtonLink))}">${esc(b.SecondButtonText)}</a>` : '';
      return `<article class="banner-slide"><div class="banner-copy"><span class="eyebrow">${esc(b.Eyebrow || 'Pranavam Academy')}</span><h1>${esc(b.Title || '')}</h1><p>${esc(b.Subtitle || b.Description || '')}</p><div class="banner-actions">${btn1}${btn2}</div></div><div class="banner-media"><div class="banner-logo-card"><img src="${esc(img)}" alt="${esc(b.Title || 'Pranavam Academy')}" loading="lazy" /></div></div></article>`;
    }).join('');
    dots.innerHTML = slides.map((_, i) => `<button class="banner-dot${i===0?' active':''}" type="button" aria-label="Show banner ${i+1}"></button>`).join('');
    let current = 0;
    const go = i => {
      current = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.querySelectorAll('.banner-dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    };
    dots.querySelectorAll('.banner-dot').forEach((d, i) => d.addEventListener('click', () => go(i)));
    if(slides.length > 1) setInterval(() => go(current + 1), 5000);
  }

  function renderMenus(items){
    const menu = active(items);
    const top = menu.filter(x => !String(x.ParentID || '').trim());
    const childrenOf = id => menu.filter(x => String(x.ParentID || '').trim() === String(id));
    const linkTarget = item => String(item.OpenType || 'Same').toLowerCase() === 'new' ? ' target="_blank" rel="noopener"' : '';
    const itemHtml = item => {
      const kids = childrenOf(item.MenuID);
      const arrow = kids.length ? ' <span>▾</span>' : '';
      const sub = kids.length ? `<div class="submenu">${kids.map(k=>`<a href="${esc(normalizeLink(k.PageLink))}"${linkTarget(k)}>${esc(k.MenuName)}</a>`).join('')}</div>` : '';
      return `<div class="menu-item"><a class="menu-link" href="${esc(normalizeLink(item.PageLink))}"${linkTarget(item)}>${esc(item.MenuName)}${arrow}</a>${sub}</div>`;
    };
    document.getElementById('desktopMenu').innerHTML = top.map(itemHtml).join('');
    document.getElementById('mobileMenu').innerHTML = top.map(itemHtml).join('');
    document.getElementById('footerMenu').innerHTML = menu.filter(x => String(x.Footer || '').toLowerCase() === 'yes' && !String(x.ParentID||'').trim())
      .map(x => `<a href="${esc(normalizeLink(x.PageLink))}"${linkTarget(x)}>${esc(x.MenuName)}</a>`).join('');
  }

  function renderPrograms(programs){
    const online = active((programs || []).filter(x=>String(x.Type||'').toLowerCase()==='online'));
    const offline = active((programs || []).filter(x=>String(x.Type||'').toLowerCase()==='offline'));
    const html = p => {
      const img = p.ImageURL || p.Image || '';
      const id = programId(p);
      return `<article class="card program-card" id="${esc(id)}">${img ? `<img class="card-image" src="${esc(img)}" alt="${esc(p.Title || p.ProgramName || 'Program')}" loading="lazy" />` : ''}<span class="tag">${esc(p.Tag || p.Type || 'Program')}</span><h3>${esc(p.Title || p.ProgramName || '')}</h3><p>${esc(p.Description || '')}</p></article>`;
    };
    document.getElementById('onlineCards').innerHTML = online.map(html).join('');
    document.getElementById('offlineCards').innerHTML = offline.map(html).join('');
  }

  function renderPackages(packages){
    const html = p => { const img = p.ImageURL || p.Image || ''; return `<article class="card package-card">${img ? `<img class="card-image" src="${esc(img)}" alt="${esc(p.Title || p.PackageName || 'Package')}" loading="lazy" />` : ''}<span class="tag">${esc(p.Duration || 'Package')}</span><h3>${esc(p.Title || p.PackageName || '')}</h3><p>${esc(p.Description || '')}</p><strong>${esc(p.Price || '')}</strong></article>`; };
    document.getElementById('packageCards').innerHTML = active(packages).map(html).join('');
  }

  async function submitForm(form, action, statusId){
    const status = document.getElementById(statusId);
    const data = Object.fromEntries(new FormData(form).entries());
    data.FormType = action;
    status.textContent = 'Submitting...';
    const url = apiUrl('submitForm');
    if(!url){
      const msg = encodeURIComponent(`Pranavam Academy Enquiry\n${Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n')}`);
      window.open(`https://wa.me/${whatsapp}?text=${msg}`,'_blank');
      status.textContent = 'Backend URL not configured. Details opened in WhatsApp.';
      return;
    }
    try{
      const res = await fetch(url, {method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'text/plain;charset=utf-8'}});
      const json = await res.json();
      if(json.ok){ form.reset(); status.textContent = 'Submitted successfully. Our team will contact you soon.'; }
      else status.textContent = json.message || 'Could not submit. Please try WhatsApp.';
    }catch(err){ status.textContent = 'Could not submit. Please try WhatsApp.'; }
  }

  function bind(){
    const waText = encodeURIComponent('Hello Pranavam Academy, I would like to know more about your programs.');
    const waUrl = `https://wa.me/${whatsapp}?text=${waText}`;
    ['topWhatsapp'].forEach(id=>{ const el=document.getElementById(id); if(el) el.href=waUrl; });
    const toggle = document.getElementById('menuToggle');
    const mobile = document.getElementById('mobileMenu');
    toggle.addEventListener('click',()=>{ const open = mobile.classList.toggle('open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    mobile.addEventListener('click', e=>{ if(e.target.tagName === 'A') mobile.classList.remove('open'); });
    document.getElementById('studentForm').addEventListener('submit', e=>{ e.preventDefault(); submitForm(e.target,'Student Registration','studentStatus'); });
    document.getElementById('corporateForm').addEventListener('submit', e=>{ e.preventDefault(); submitForm(e.target,'Corporate Chair Yoga Enquiry','corporateStatus'); });
    document.getElementById('teacherForm').addEventListener('submit', e=>{ e.preventDefault(); submitForm(e.target,'Teacher Application','teacherStatus'); });
  }

  async function init(){
    bind();
    renderMenus(await getJson('getMenu', fallbackMenu));
    const publicData = await getJson('getPublicData', {banners:fallbackBanners, programs:fallbackPrograms, packages:fallbackPackages});
    renderBanners(publicData.banners || fallbackBanners);
    renderPrograms(publicData.programs || fallbackPrograms);
    renderPackages(publicData.packages || fallbackPackages);
    if(location.hash){
      setTimeout(() => {
        const target = document.querySelector(location.hash);
        if(target) target.scrollIntoView({block:'start'});
      }, 80);
    }
  }

  init();

  let deferredPrompt;
  function setInstallHandlers(){
    const buttons = ['installBtnTop','installBtnFooter'].map(id => document.getElementById(id)).filter(Boolean);
    buttons.forEach(btn => {
      btn.onclick = async () => {
        if(deferredPrompt){
          deferredPrompt.prompt();
          try{ await deferredPrompt.userChoice; }catch(e){}
          deferredPrompt = null;
        } else {
          alert('To install the app, use your browser menu and choose Add to Home Screen or Install App.');
        }
      };
    });
  }
  setInstallHandlers();
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    setInstallHandlers();
  });

  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }
})();
