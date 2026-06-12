const CONFIG = {
  PACKAGES_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYxxBM1iT9wIlVHfA-X7EscBKS0eeX2l7vdVvFJHOTycM7nPqZGyiRqwlk7xW6Xt0-NaVkiH7tZbCo/pub?gid=442570969&single=true&output=csv",
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyQlbj8EFnwkYHdR3fmFPP0VTbQs_QPll1j8cj5MgdiyGLgRGWii_XidUmiWein2W95tw/exec",
  WHATSAPP_NUMBER: "918921696649"
};

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('open'));
  loadPackages();
  handleForms();
});

function parseCSV(text){
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c==='"'&&q&&n==='"'){cell+='"';i++;continue}
    if(c==='"'){q=!q;continue}
    if(c===','&&!q){row.push(cell.trim());cell='';continue}
    if((c==='\n'||c==='\r')&&!q){if(cell||row.length){row.push(cell.trim());rows.push(row);row=[];cell=''}continue}
    cell+=c;
  }
  if(cell||row.length){row.push(cell.trim());rows.push(row)}
  const headers=rows.shift()?.map(h=>h.trim())||[];
  return rows.filter(r=>r.length).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])));
}

async function loadPackages(){
  const target=document.querySelector('#packagesGrid');
  if(!target) return;
  let data = fallbackPackages();
  if(CONFIG.PACKAGES_CSV_URL && !CONFIG.PACKAGES_CSV_URL.includes('PASTE_')){
    try{
      const res=await fetch(CONFIG.PACKAGES_CSV_URL);
      const csvData=parseCSV(await res.text()).filter(p=>isActivePackage(p) && hasPackageName(p));
      if(csvData.length) data = csvData;
    }catch(e){ console.warn('Package CSV loading failed. Showing default packages.'); }
  }
  data = ensureTrialPackages(data);
  data = applyUrlPackageFilter(data);
  target.innerHTML=data.map(packageCard).join('') || '<p>No active packages found.</p>';
  setupFilters(data);
}

function hasPackageName(p){ return !!getVal(p,'Program','PackageName','Name','ClassName'); }

function isActivePackage(p){
  const active = getVal(p,'Active','Status');
  if(!active) return true;
  return ['yes','active','true','1'].includes(active.toLowerCase());
}

function applyUrlPackageFilter(data){
  const params = new URLSearchParams(window.location.search);
  const program = params.get('program') || params.get('package') || params.get('class');
  const duration = params.get('duration');
  const mode = params.get('mode');
  if(!program && !duration && !mode) return data;
  let filtered = data.filter(p=>{
    const hay = [getVal(p,'Program'), getVal(p,'PackageName'), getVal(p,'Name'), getVal(p,'ClassName'), getVal(p,'Category')].join(' ').toLowerCase();
    const programOk = !program || hay.includes(program.toLowerCase());
    const durationOk = !duration || getVal(p,'Duration').toLowerCase() === duration.toLowerCase();
    const modeOk = !mode || getVal(p,'Mode','ProgramType').toLowerCase() === mode.toLowerCase();
    return programOk && durationOk && modeOk;
  });
  const title = document.querySelector('#packagesTitle') || document.querySelector('section h2');
  const lead = document.querySelector('#packagesLead') || document.querySelector('section .lead');
  if(filtered.length && title) title.textContent = program ? `${program} Packages` : 'Selected Packages';
  if(filtered.length && lead) lead.textContent = 'Showing only the selected package details. Use the Packages menu to view all packages.';
  return filtered.length ? filtered : data;
}

function ensureTrialPackages(data){
  const hasGroupTrial = data.some(p => /online group yoga|online yoga/i.test(getVal(p,'Program','PackageName','Name','ClassName')) && /trial|free/i.test([getVal(p,'Duration'), getVal(p,'Type'), getVal(p,'Price')].join(' ')));
  const hasCorporateTrial = data.some(p => /corporate chair yoga/i.test(getVal(p,'Program','PackageName','Name','ClassName')) && /trial|free/i.test([getVal(p,'Duration'), getVal(p,'Type'), getVal(p,'Price')].join(' ')));
  const trials=[];
  if(!hasGroupTrial) trials.push({Program:'Online Group Yoga Class',Mode:'Online',Duration:'1 Month Trial',Price:'Free',Currency:'',Type:'Trial',Active:'Yes',Description:'Free one month trial for live online group yoga classes.',Features:'Free one month trial|Live online group sessions|Beginner friendly|After trial continue on donation basis'});
  if(!hasCorporateTrial) trials.push({Program:'15 Minutes Online Corporate Chair Yoga',Mode:'Online',Duration:'1 Month Trial',Price:'Free',Currency:'',Type:'Trial',Active:'Yes',Description:'Free one month trial for corporate chair yoga sessions.',Features:'Free one month trial|15-minute staff sessions|Workplace stress relief|Suitable for employees'});
  return [...trials, ...data];
}

function escapeHTML(value){
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function getVal(p, ...keys){
  for(const k of keys){
    if(p[k] !== undefined && String(p[k]).trim() !== '') return String(p[k]).trim();
  }
  return '';
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
  const currency=getVal(p,'Currency');
  const type=getVal(p,'Type');
  if(type.toLowerCase()==='donation') return 'Donation-Based';
  if(!raw) return 'Contact for Fee';
  if(raw.toLowerCase().includes('free')) return 'Free';
  if(raw.toLowerCase().includes('donation') || raw.toLowerCase().includes('any amount')) return 'Donation-Based';
  if(raw.toLowerCase().includes('contact') || raw.toLowerCase().includes('custom')) return raw;
  if(currency && raw && !raw.toUpperCase().includes(currency.toUpperCase())){
    if(currency.toUpperCase()==='INR') return `₹${raw}`;
    if(currency.toUpperCase()==='USD') return `$${raw}`;
    return `${raw} ${currency}`;
  }
  return raw;
}

function fieldLabel(key){
  return key.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\b\w/g, c => c.toUpperCase());
}

function packageFeatures(p){
  const features = getVal(p,'Features','Includes','PackageDetails','Details','Benefits');
  if(features) return features.split('|').map(x=>x.trim()).filter(Boolean);
  return [];
}

function packageDetails(p){
  const hidden = new Set(['Status','Active','PackageName','Name','ClassName','Price','Fee','Amount','PackageFee','Package Fee','Description','ShortDescription','Features','Includes','PackageDetails','Details','Benefits']);
  const ordered = ['PackageID','Mode','Category','Program','ClassType','Duration','Frequency','Sessions','ClassTime','Timing','BatchDays','Batch Days','Level','AgeGroup','Age Group','Instructor','Location','AdmissionFee','Admission Fee','MonthlyFee','Monthly Fee','ReferralDiscount','Referral Discount','TrialAvailable','Trial Available','Notes'];
  const rows=[]; const used=new Set();
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
  const name=getVal(p,'PackageName','Name','ClassName','Program') || 'Package';
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
    <div class="btns"><a class="btn btn-green" href="register.html?package=${encodeURIComponent(name)}">Register</a><a class="btn btn-outline-green" href="packages.html?program=${encodeURIComponent(name)}${getVal(p,'Duration') ? '&duration=' + encodeURIComponent(getVal(p,'Duration')) : ''}">View Only This Package</a></div>
  </article>`;
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

function fallbackPackages(){return [
 {Program:'Online Group Yoga Class',Mode:'Online',Duration:'1 Month Trial',Price:'Free',Currency:'',Type:'Trial',Active:'Yes',Description:'Free one month trial for live online group yoga classes.',Features:'Free one month trial|Live online group sessions|Asana, pranayama and relaxation|Beginner friendly'},
 {Program:'Online Group Yoga Class',Mode:'Online',Duration:'After Trial',Price:'Donation-Based',Currency:'',Type:'Donation',Active:'Yes',Description:'After the free trial, continue on a donation basis. Students can contribute any amount they wish.',Features:'No minimum donation|No suggested donation|Pay whatever you like|A portion supports charity and yoga promotion'},
 {Program:'15 Minutes Online Corporate Chair Yoga',Mode:'Online',Duration:'1 Month Trial',Price:'Free',Currency:'',Type:'Trial',Active:'Yes',Description:'Free one month trial for companies and teams.',Features:'15-minute staff sessions|Workplace stress relief|Posture and breathing support|Suitable for employees'},
 {Program:'15 Minutes Online Corporate Chair Yoga',Mode:'Online',Duration:'Monthly',Price:'Custom Package',Currency:'',Type:'Paid',Active:'Yes',Description:'Corporate wellness program for companies, teams and organizations.',Features:'15-minute online sessions|Stress relief and posture support|Suitable for office staff|Custom corporate package'},
 {Program:'Online Therapeutic Yoga',Mode:'Online',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Personalized yoga support for wellbeing and flexibility.',Features:'Gentle guided yoga|Breathing and relaxation|Individual attention|Suitable for specific wellness goals'},
 {Program:'Online Karate',Mode:'Online',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Online karate training for discipline, fitness and confidence.',Features:'Basic techniques|Fitness drills|Discipline and confidence building'},
 {Program:'Online Dance',Mode:'Online',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Online dance training for rhythm, movement and expression.',Features:'Step-by-step learning|Creative movement|Beginner-friendly sessions'},
 {Program:'Online Music',Mode:'Online',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Online music learning with guided practice.',Features:'Vocal or instrument guidance|Practice support|Beginner-friendly approach'},
 {Program:'Online Drawing',Mode:'Online',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Online drawing and creative art sessions for students.',Features:'Basic drawing skills|Creative projects|Step-by-step guidance'},
 {Program:'Offline Yoga',Mode:'Offline',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Traditional in-person yoga classes at the academy.',Features:'Asanas and pranayama|Meditation and relaxation|In-person correction and guidance'},
 {Program:'Offline Karate',Mode:'Offline',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Discipline, fitness, self-confidence and self-defense.',Features:'Karate basics|Fitness and discipline|Self-defense skills'},
 {Program:'Offline Dance',Mode:'Offline',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Creative movement and performance skills.',Features:'Dance basics|Choreography practice|Stage confidence'},
 {Program:'Offline Music',Mode:'Offline',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Music training at the academy with guided practice.',Features:'Foundational learning|Voice or instrument support|Regular practice'},
 {Program:'Offline Drawing',Mode:'Offline',Duration:'Monthly',Price:'Contact for Fee',Currency:'',Type:'Paid',Active:'Yes',Description:'Drawing and creative arts training at the academy.',Features:'Sketching basics|Color and composition|Creative projects'}
]}

function handleForms(){
  document.querySelectorAll('form[data-sheet]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=form.querySelector('.form-message');

    if(!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('PASTE_')){
      if(msg) msg.textContent='Form is ready. Please connect the backend URL in assets/app.js.';
      return;
    }

    const formData = new FormData(form);
    if(!formData.get('type')) formData.append('type','student');

    try{
      await fetch(CONFIG.APPS_SCRIPT_URL,{
        method:'POST',
        mode:'no-cors',
        body:formData
      });
      form.reset();
      if(msg) msg.textContent='Thank you. Your details have been submitted.';
    }
    catch(err){
      if(msg) msg.textContent='Submission failed. Please contact us on WhatsApp.';
    }
  }))
}
