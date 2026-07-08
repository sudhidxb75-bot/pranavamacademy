(function(){
  const config = window.PRANAVAM_CONFIG || {};
  const url = config.WEB_APP_URL || '';
  let adminPassword = sessionStorage.getItem('pranavamAdminPassword') || '';
  let latest = null;

  const els = {
    loginPanel: document.getElementById('loginPanel'),
    dashboardPanel: document.getElementById('dashboardPanel'),
    loginForm: document.getElementById('adminLoginForm'),
    loginStatus: document.getElementById('loginStatus'),
    adminStatus: document.getElementById('adminStatus'),
    logout: document.getElementById('adminLogout'),
    statGrid: document.getElementById('statGrid')
  };

  function setStatus(msg, isError){
    els.adminStatus.textContent = msg || '';
    els.adminStatus.style.color = isError ? '#b42318' : 'var(--green)';
  }

  async function post(action, extra){
    if(!url || url.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')){
      throw new Error('Please update WEB_APP_URL in assets/config.js first.');
    }
    const payload = Object.assign({Action: action, AdminPassword: adminPassword}, extra || {});
    const res = await fetch(url, {method:'POST', body: JSON.stringify(payload), headers:{'Content-Type':'text/plain;charset=utf-8'}});
    return await res.json();
  }

  function html(v){
    return String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function formatDate(v){
    if(!v) return '';
    const d = new Date(v);
    if(isNaN(d.getTime())) return v;
    return d.toLocaleString();
  }

  function table(rows, preferred){
    rows = Array.isArray(rows) ? rows : [];
    if(!rows.length) return '<div class="empty-state">No records found.</div>';
    const keys = preferred && preferred.length ? preferred.filter(k => Object.prototype.hasOwnProperty.call(rows[0], k)) : Object.keys(rows[0]);
    const head = keys.map(k => `<th>${html(k)}</th>`).join('');
    const body = rows.map(r => `<tr>${keys.map(k => `<td>${html(k.toLowerCase().includes('timestamp') ? formatDate(r[k]) : r[k])}</td>`).join('')}</tr>`).join('');
    return `<table class="admin-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderStats(data){
    const stats = data.summary || {};
    const cards = [
      ['Student Enquiries', stats.studentEnquiries || 0],
      ['Corporate Leads', stats.corporateLeads || 0],
      ['Teacher Applications', stats.teacherApplications || 0],
      ['Active Programs', stats.activePrograms || 0],
      ['Active Packages', stats.activePackages || 0],
      ['Active Banners', stats.activeBanners || 0],
      ['Today Enquiries', stats.todayEnquiries || 0],
      ['Total Leads', stats.totalLeads || 0]
    ];
    els.statGrid.innerHTML = cards.map(([label,value]) => `<div class="stat-card"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }

  function render(data){
    latest = data;
    renderStats(data);
    const fields = {
      students:['Timestamp','Name','Phone','Email','Program','Mode','Message','Source','Status','FollowUpDate','Notes'],
      corporate:['Timestamp','CompanyName','ContactPerson','Phone','Email','TeamSize','Message','Source','Status','FollowUpDate','Notes'],
      teachers:['Timestamp','Name','Phone','Email','Specialization','Mode','Message','Source','Status','Notes'],
      packages:['PackageID','Title','Duration','Price','Description','ImageURL','SortOrder','Status'],
      programs:['ProgramID','Type','Title','Description','Tag','ImageURL','SortOrder','Status'],
      banners:['BannerID','Eyebrow','Title','Subtitle','ButtonText','ButtonLink','ImageURL','SortOrder','Status'],
      reports:['ReportName','Value','UpdatedAt']
    };
    document.getElementById('studentsTable').innerHTML = table(data.students, fields.students);
    document.getElementById('corporateTable').innerHTML = table(data.corporate, fields.corporate);
    document.getElementById('teachersTable').innerHTML = table(data.teachers, fields.teachers);
    document.getElementById('packagesTable').innerHTML = table(data.packages, fields.packages);
    document.getElementById('programsTable').innerHTML = table(data.programs, fields.programs);
    document.getElementById('bannersTable').innerHTML = table(data.banners, fields.banners);
    document.getElementById('reportsTable').innerHTML = table(data.reports, fields.reports);
    document.getElementById('printStudentsTable').innerHTML = table(data.students, ['Timestamp','Name','Phone','Program','Mode','Status','FollowUpDate','Notes']);
    document.getElementById('printCorporateTable').innerHTML = table(data.corporate, ['Timestamp','CompanyName','ContactPerson','Phone','Email','TeamSize','Status','FollowUpDate','Notes']);
    document.getElementById('printTeachersTable').innerHTML = table(data.teachers, ['Timestamp','Name','Phone','Specialization','Mode','Status','Notes']);
  }

  async function loadDashboard(){
    setStatus('Loading dashboard...');
    const json = await post('getAdminData');
    if(!json.ok) throw new Error(json.message || 'Could not load admin data.');
    els.loginPanel.hidden = true;
    els.dashboardPanel.hidden = false;
    els.logout.hidden = false;
    render(json.data || {});
    setStatus('Dashboard updated.');
  }

  els.loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    adminPassword = new FormData(e.target).get('password');
    els.loginStatus.textContent = 'Checking password...';
    try{
      const json = await post('adminLogin');
      if(!json.ok) throw new Error(json.message || 'Invalid password.');
      sessionStorage.setItem('pranavamAdminPassword', adminPassword);
      els.loginStatus.textContent = '';
      await loadDashboard();
    }catch(err){ els.loginStatus.textContent = err.message; }
  });

  document.getElementById('refreshData').addEventListener('click', () => loadDashboard().catch(err => setStatus(err.message, true)));
  document.getElementById('generateReports').addEventListener('click', async () => {
    try{ setStatus('Creating reports and print sheets...'); const json = await post('generateReports'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Reports created.'); await loadDashboard(); }catch(err){ setStatus(err.message, true); }
  });
  document.getElementById('backupData').addEventListener('click', async () => {
    try{ setStatus('Creating backup...'); const json = await post('backupMainData'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Backup completed.'); }catch(err){ setStatus(err.message, true); }
  });
  document.getElementById('clearReports').addEventListener('click', async () => {
    if(!confirm('This will clear generated report and print sheets only. Main registrations will not be deleted. Continue?')) return;
    try{ setStatus('Clearing generated reports...'); const json = await post('clearGeneratedReports'); if(!json.ok) throw new Error(json.message); setStatus(json.message || 'Generated reports cleared.'); await loadDashboard(); }catch(err){ setStatus(err.message, true); }
  });
  els.logout.addEventListener('click', () => { sessionStorage.removeItem('pranavamAdminPassword'); location.reload(); });

  document.querySelectorAll('.admin-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  if(adminPassword){ loadDashboard().catch(() => { sessionStorage.removeItem('pranavamAdminPassword'); }); }
})();
