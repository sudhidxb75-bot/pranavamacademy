(function(){
  const config = Object.assign({APPS_SCRIPT_URL:'', WEB_APP_URL:''}, window.PRANAVAM_CONFIG || {});
  const url = String(config.APPS_SCRIPT_URL || config.WEB_APP_URL || '').trim();
  let adminPassword = sessionStorage.getItem('pranavamAdminPassword') || '';

  const els = {
    loginPanel: document.getElementById('loginPanel'),
    dashboardPanel: document.getElementById('dashboardPanel'),
    loginForm: document.getElementById('adminLoginForm'),
    loginStatus: document.getElementById('loginStatus'),
    adminStatus: document.getElementById('adminStatus'),
    logout: document.getElementById('adminLogout'),
    statGrid: document.getElementById('statGrid')
  };

  function setStatus(msg, isError){ if(els.adminStatus){ els.adminStatus.textContent = msg || ''; els.adminStatus.style.color = isError ? '#b42318' : 'var(--green)'; } }
  function html(v){ return String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function isPlaceholder(u){ return !u || u.includes('PASTE_') || u.includes('YOUR_GOOGLE_APPS_SCRIPT'); }
  function jsonp(action, extra){
    return new Promise((resolve, reject) => {
      if(isPlaceholder(url)) return reject(new Error('Please update APPS_SCRIPT_URL in assets/config.js first.'));
      const callbackName = 'pranavamAdminCallback_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      let script;
      const cleanup = () => { if(script && script.parentNode) script.parentNode.removeChild(script); try{ delete window[callbackName]; }catch(e){ window[callbackName] = undefined; } };
      try{
        const u = new URL(url);
        u.searchParams.set('action','adminAction');
        u.searchParams.set('adminAction', action);
        u.searchParams.set('password', adminPassword);
        u.searchParams.set('callback', callbackName);
        Object.entries(extra || {}).forEach(([k,v]) => { if(v !== undefined && v !== null) u.searchParams.set(k, v); });
        window[callbackName] = data => { cleanup(); resolve(data); };
        script = document.createElement('script');
        script.src = u.toString();
        script.async = true;
        script.onerror = () => { cleanup(); reject(new Error('Admin request failed.')); };
        document.head.appendChild(script);
        setTimeout(() => { if(window[callbackName]){ cleanup(); reject(new Error('Admin request timed out.')); } }, 18000);
      }catch(err){ cleanup(); reject(err); }
    });
  }
  async function post(action, extra){ return await jsonp(action, extra); }

  function table(rows, preferred){
    rows = Array.isArray(rows) ? rows : [];
    if(!rows.length) return '<div class="empty-state">No records found.</div>';
    let keys = preferred && preferred.length ? preferred.filter(k => rows.some(r => Object.prototype.hasOwnProperty.call(r, k))) : Object.keys(rows[0]);
    if(!keys.length) keys = Object.keys(rows[0]);
    return `<table class="admin-table"><thead><tr>${keys.map(k=>`<th>${html(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${keys.map(k=>`<td>${html(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function renderStats(data){
    const s = data.summary || {};
    const cards = [
      ['Student Enquiries', s.registrations || 0],
      ['Corporate Leads', s.corporateLeads || 0],
      ['Teacher Applications', s.teacherApplications || 0],
      ['Active Packages', s.activePackages || 0],
      ['Active Banners', s.activeBanners || 0],
      ['Menu Items', s.activeMenuItems || 0],
      ['Site Images', s.siteImages || 0],
      ['Today Enquiries', s.todayEnquiries || 0]
    ];
    els.statGrid.innerHTML = cards.map(([label,value]) => `<div class="stat-card"><span>${html(label)}</span><strong>${html(value)}</strong></div>`).join('');
  }
  function render(data){
    renderStats(data);
    const fields = {
      registrations:['Timestamp','Name','Phone','Email','Program','Mode','PackageName','ReferralCode','Location','Status','PaymentStatus','Message','Notes'],
      corporate:['Timestamp','CompanyName','ContactPerson','Phone','Email','CityCountry','CompanySize','Program','PackageID','PackageName','PackageFee','PreferredTime','PreferredSchedule','Status','Notes'],
      teachers:['Timestamp','Name','Phone','Email','Subject','TeachingMode','Experience','Status','Notes'],
      packages:['PackageID','Mode','Category','PackageName','Price','Duration','Frequency','Sessions','ClassTime','Status'],
      banners:['BannerID','Page','SortOrder','Badge','Title','Subtitle','ImageURL','ButtonText','ButtonLink','Status'],
      menu:['MenuID','ParentID','MenuName','PageLink','SortOrder','Status','OpenType','Footer'],
      images:['ImageKey','SectionName','ImageURL','AltText','Status','Notes'],
      reports:['ReportName','Rows','UpdatedAt']
    };
    document.getElementById('registrationsTable').innerHTML = table(data.registrations, fields.registrations);
    document.getElementById('corporateTable').innerHTML = table(data.corporate, fields.corporate);
    document.getElementById('teachersTable').innerHTML = table(data.teachers, fields.teachers);
    document.getElementById('packagesTable').innerHTML = table(data.packages, fields.packages);
    document.getElementById('bannersTable').innerHTML = table(data.banners, fields.banners);
    document.getElementById('menuTable').innerHTML = table(data.menu, fields.menu);
    document.getElementById('imagesTable').innerHTML = table(data.images, fields.images);
    document.getElementById('reportsTable').innerHTML = table(data.reports, fields.reports);
    document.getElementById('printStudentsTable').innerHTML = table(data.registrations, ['Timestamp','Name','Phone','Program','Mode','Status','Notes']);
    document.getElementById('printCorporateTable').innerHTML = table(data.corporate, ['Timestamp','CompanyName','ContactPerson','Phone','Email','CompanySize','Status','Notes']);
    document.getElementById('printTeachersTable').innerHTML = table(data.teachers, ['Timestamp','Name','Phone','Subject','TeachingMode','Status','Notes']);
  }
  async function loadDashboard(){
    setStatus('Loading dashboard...');
    const json = await post('getAdminData');
    if(!json.ok) throw new Error(json.message || 'Could not load admin data.');
    els.loginPanel.hidden = true; els.dashboardPanel.hidden = false; els.logout.hidden = false;
    render(json.data || {}); setStatus('Dashboard updated.');
  }
  if(els.loginForm){
    els.loginForm.addEventListener('submit', async e => {
      e.preventDefault(); adminPassword = new FormData(e.target).get('password'); els.loginStatus.textContent = 'Checking password...';
      try{ const json = await post('adminLogin'); if(!json.ok) throw new Error(json.message || 'Invalid password.'); sessionStorage.setItem('pranavamAdminPassword', adminPassword); els.loginStatus.textContent=''; await loadDashboard(); }
      catch(err){ els.loginStatus.textContent = err.message; }
    });
  }
  document.getElementById('refreshData')?.addEventListener('click', () => loadDashboard().catch(err => setStatus(err.message, true)));
  document.getElementById('generateReports')?.addEventListener('click', async () => { try{ setStatus('Creating reports...'); const json = await post('generateReports'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Reports created.'); await loadDashboard(); }catch(err){ setStatus(err.message, true); }});
  document.getElementById('backupData')?.addEventListener('click', async () => { try{ setStatus('Creating backup...'); const json = await post('backupMainData'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Backup completed.'); }catch(err){ setStatus(err.message, true); }});
  document.getElementById('clearReports')?.addEventListener('click', async () => { if(!confirm('This clears generated report sheets only. Main registration data will not be deleted. Continue?')) return; try{ setStatus('Clearing generated reports...'); const json = await post('clearGeneratedReports'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Generated reports cleared.'); await loadDashboard(); }catch(err){ setStatus(err.message, true); }});
  els.logout?.addEventListener('click', () => { sessionStorage.removeItem('pranavamAdminPassword'); location.reload(); });
  document.querySelectorAll('.admin-tabs button').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.admin-tabs button').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active')); btn.classList.add('active'); document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active'); }));
  if(adminPassword){ loadDashboard().catch(() => sessionStorage.removeItem('pranavamAdminPassword')); }
})();
