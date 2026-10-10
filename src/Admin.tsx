import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { ArrowLeft, LayoutDashboard, FolderKanban, Tags, Settings, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Save, X, Youtube, MonitorPlay, MousePointer2, Upload, Download, RotateCcw, Smartphone, RectangleHorizontal, Images, List } from 'lucide-react';
import { readCMS, writeCMS, youtubeThumbnail, sanitizeSvg, getSvgPaths, updateSvgPath, type CMSData, type Category, type Project, type SvgPathAttributes, type GalleryImage } from './cms';
import { supabase } from './supabase';

type Tab = 'overview' | 'projects' | 'categories' | 'services' | 'gallery' | 'settings' | 'cursor';
const emptyProject = (): Project => ({ id: crypto.randomUUID(), name: '', categoryId: '', description: '', youtubeUrl: '', coverUrl: '', images: ['', ''], featured: false, published: true, type: 'Client', format: 'landscape' });
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') .replace(/^-|-$/g, '') || crypto.randomUUID();

export default function Admin() {
  const [data, setData] = useState<CMSData>(() => readCMS());
  const [tab, setTab] = useState<Tab>('overview');
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Category | null>(null);
  const [notice, setNotice] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
const [loginLoading, setLoginLoading] = useState(false);
const [userEmail, setUserEmail] = useState('');
const [password, setPassword] = useState('');
const [authError, setAuthError] = useState('');
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [cmsLoaded, setCmsLoaded] = useState(false);
const [savingCMS, setSavingCMS] = useState(false);

useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data, error }) => {
    if (!mounted) return;

    if (error) {
      setAuthError(error.message);
    }

    setIsAuthenticated(!!data.session);
    setAuthLoading(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!mounted) return;

    setIsAuthenticated(!!session);
    setAuthLoading(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  setLoginLoading(true);
  setAuthError('');

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail.trim(),
      password,
    });

    if (error) throw error;

    setPassword('');
  } catch (error) {
    setAuthError(
      error instanceof Error
        ? error.message
        : 'تعذر تسجيل الدخول.'
    );
  } finally {
    setLoginLoading(false);
  }
};

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    setAuthError(error.message);
    return;
  }

  setPassword('');
};
  // Load the shared CMS row only after authentication has been checked.
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setCmsLoaded(false);
      return;
    }

    let cancelled = false;
    const loadCMS = async () => {
      setNotice('Loading portfolio data…');
      try {
        const { data: row, error } = await supabase
          .from('portfolio_content')
          .select('content')
          .eq('id', 1)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;

        if (row?.content) {
          const remote = row.content as CMSData;
          setData({
            ...readCMS(),
            ...remote,
            settings: { ...readCMS().settings, ...(remote.settings || {}) },
            categories: Array.isArray(remote.categories) ? remote.categories : readCMS().categories,
            projects: Array.isArray(remote.projects) ? remote.projects : readCMS().projects,
            services: Array.isArray(remote.services) ? remote.services : readCMS().services,
            gallery: Array.isArray(remote.gallery) ? remote.gallery : readCMS().gallery,
          });
        } else {
          // First admin visit: seed the cloud database with the existing local/default content.
          const initial = readCMS();
          const { error: insertError } = await supabase
            .from('portfolio_content')
            .upsert({ id: 1, content: initial, updated_at: new Date().toISOString() }, { onConflict: 'id' });
          if (insertError) throw insertError;
          if (!cancelled) setData(initial);
        }
        if (!cancelled) {
          setCmsLoaded(true);
          setNotice('Portfolio data loaded from Supabase.');
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : 'تعذر تحميل بيانات الموقع من Supabase.');
          setNotice('Could not load cloud data. Check the Supabase table and policies.');
        }
      }
    };

    void loadCMS();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated]);

  // Save shared data after edits. The short delay avoids writing on every keystroke.
  useEffect(() => {
    if (!isAuthenticated || !cmsLoaded) return;
    const timer = window.setTimeout(async () => {
      setSavingCMS(true);
      try {
        const { error } = await supabase
          .from('portfolio_content')
          .upsert({ id: 1, content: data, updated_at: new Date().toISOString() }, { onConflict: 'id' });
        if (error) throw error;
        writeCMS(data); // keep a local backup for this browser
        setNotice('Saved to Supabase.');
      } catch (error) {
        setNotice(error instanceof Error ? `Cloud save failed: ${error.message}` : 'Cloud save failed.');
      } finally {
        setSavingCMS(false);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [data, isAuthenticated, cmsLoaded]);

  const published = useMemo(() => data.projects.filter(p => p.published), [data.projects]);

  if (authLoading) {
  return (
    <div className="admin-shell">
      <main className="admin-main">
        <p>Checking authentication...</p>
      </main>
    </div>
  );
}

if (!isAuthenticated) {
  return (
    <div className="admin-shell">
      <main className="admin-main">
        <form className="admin-modal small-modal" onSubmit={handleLogin}>
          <div className="modal-heading">
            <div>
              <span className="eyebrow">HONDA CREATOR CMS</span>
              <h2>Admin Login</h2>
            </div>
          </div>

          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {authError && (
            <p className="cursor-error" role="alert">
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="admin-primary"
            disabled={loginLoading}
          >
            {loginLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    </div>
  );
}
  const updateSettings = <K extends keyof CMSData['settings']>(key: K, value: CMSData['settings'][K]) => setData(d => ({ ...d, settings: { ...d.settings, [key]: value } }));
  
  const saveProject = (e: FormEvent) => {
    e.preventDefault();
    if (!projectDraft) return;
    if (!projectDraft.name.trim()) { setNotice('اكتب اسم المشروع الأول.'); return; }
    setData(d => ({ ...d, projects: d.projects.some(p => p.id === projectDraft.id) ? d.projects.map(p => p.id === projectDraft.id ? projectDraft : p) : [projectDraft, ...d.projects] }));
    setProjectDraft(null); setNotice('Project updated. Saving to Supabase…');
  };

  // دالة تحريك المشروع لأعلى
  const moveProjectUp = (index: number) => {
    if (index === 0) return;
    const newProjects = [...data.projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index - 1];
    newProjects[index - 1] = temp;
    setData(d => ({ ...d, projects: newProjects }));
  };

  // دالة تحريك المشروع لأسفل
  const moveProjectDown = (index: number) => {
    if (index === data.projects.length - 1) return;
    const newProjects = [...data.projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index + 1];
    newProjects[index + 1] = temp;
    setData(d => ({ ...d, projects: newProjects }));
  };
  
  const saveCategory = (e: FormEvent) => {
    e.preventDefault(); if (!categoryDraft?.name.trim()) return;
    const exists = data.categories.some(c => c.id === categoryDraft.id);
    setData(d => ({ ...d, categories: exists ? d.categories.map(c => c.id === categoryDraft.id ? categoryDraft : c) : [...d.categories, categoryDraft] }));
    setCategoryDraft(null); setNotice('Category updated. Saving to Supabase…');
  };

  const nav: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard }, 
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'categories', label: 'Categories', icon: Tags }, 
    { id: 'services', label: 'Services', icon: List },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'settings', label: 'Site settings', icon: Settings }, 
    { id: 'cursor', label: 'Custom cursor', icon: MousePointer2 },
  ];

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span className="brand-mark">H.</span><span>{data.settings.brandName}<span className="brand-muted"> / STUDIO</span></span></a>
      <div className="sidebar-caption">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`admin-nav ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}><item.icon size={18} />{item.label}</button>)}</nav>
      <div className="sidebar-bottom"><span className="admin-status-dot" /> {savingCMS ? 'Saving to cloud…' : cmsLoaded ? 'Connected to Supabase' : 'Loading cloud data…'}</div>
    </aside>
    
    <main className="admin-main">
      <header className="admin-topbar">
        <div><span className="eyebrow">HONDA CREATOR CMS</span><h1>{nav.find(n => n.id === tab)?.label}</h1></div>

<div className="admin-top-actions">
  <a className="admin-outline" href="/" target="_blank" rel="noreferrer">
    <ExternalLink size={15} /> View website
  </a>

  <button
    type="button"
    className="admin-outline"
    onClick={handleLogout}
  >
    Log out
  </button>

  <a className="admin-avatar" href="/">H</a>
</div>
      </header>
      
      {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
      
      {tab === 'overview' && <><div className="welcome-panel"><div><span className="eyebrow">YOUR CREATIVE SPACE</span><h2>Make your work<br /><span>impossible to ignore.</span></h2><p>Manage HONDA portfolio content, categories, project formats and cursor design from one place.</p><button className="admin-primary" onClick={() => { setProjectDraft(emptyProject()); setTab('projects'); }}><Plus size={17} /> Add a project</button></div><div className="welcome-orb"><MonitorPlay size={74} strokeWidth={1} /><span>SHOW YOUR WORK</span></div></div><div className="admin-stats"><div className="stat-card"><span>Total projects</span><strong>{data.projects.length.toString().padStart(2, '0')}</strong><small>Across all categories</small></div><div className="stat-card"><span>Published</span><strong>{published.length.toString().padStart(2, '0')}</strong><small>Visible on portfolio</small></div><div className="stat-card"><span>Categories</span><strong>{data.categories.length.toString().padStart(2, '0')}</strong><small>Customizable categories</small></div></div><section className="admin-panel"><div className="panel-heading"><div><h3>Recent projects</h3><p>Your latest portfolio work</p></div><button className="admin-text-button" onClick={() => setTab('projects')}>Manage all <ArrowLeft size={15} /></button></div>{data.projects.slice(0, 4).map(p => <ProjectRow key={p.id} project={p} category={data.categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'} onEdit={() => { setProjectDraft(p); setTab('projects'); }} onToggle={() => setData(d => ({ ...d, projects: d.projects.map(x => x.id === p.id ? { ...x, published: !x.published } : x) }))} />)}</section></>}
      

      {tab === 'projects' && (
  <section className="admin-panel">
    <div className="panel-heading">
      <div>
        <h3>Portfolio projects</h3>
        <p>Choose a landscape video or vertical reel for every project.</p>
      </div>
      <button className="admin-primary" onClick={() => setProjectDraft(emptyProject())}>
        <Plus size={17} /> New project
      </button>
    </div>
    {data.projects.length === 0 ? (
      <div className="admin-empty">No projects yet. Add your first project.</div>
    ) : (
      data.projects.map((p, index) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          {/* أزرار التحريك لأعلى ولأسفل */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              type="button" 
              onClick={() => moveProjectUp(index)} 
              disabled={index === 0}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', opacity: index === 0 ? 0.3 : 1 }}
              title="تحريك لأعلى"
            >
              ▲
            </button>
            <button 
              type="button" 
              onClick={() => moveProjectDown(index)} 
              disabled={index === data.projects.length - 1}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', opacity: index === data.projects.length - 1 ? 0.3 : 1 }}
              title="تحريك لأسفل"
            >
              ▼
            </button>
          </div>

          {/* صف المشروع الأساسي */}
          <div style={{ flex: 1 }}>
            <ProjectRow 
              project={p} 
              category={data.categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'} 
              onEdit={() => setProjectDraft(p)} 
              onToggle={() => setData(d => ({ ...d, projects: d.projects.map(x => x.id === p.id ? { ...x, published: !x.published } : x) }))} 
              onDelete={() => { if (confirm(`Delete “${p.name}”?`)) setData(d => ({ ...d, projects: d.projects.filter(x => x.id !== p.id) })); }} 
            />
          </div>
        </div>
      ))
    )}
  </section>
)}
      
      {tab === 'categories' && <section className="admin-panel"><div className="panel-heading"><div><h3>Categories</h3><p>Create and rename categories used by project forms.</p></div><button className="admin-primary" onClick={() => setCategoryDraft({ id: crypto.randomUUID(), name: '', visible: true })}><Plus size={17} /> Add category</button></div>{data.categories.map(c => <div className="category-row" key={c.id}><div className="category-icon"><Tags size={18} /></div><div className="category-info"><strong>{c.name}</strong><span>{data.projects.filter(p => p.categoryId === c.id).length} projects</span></div><button className="icon-action" title={c.visible ? 'Hide category' : 'Show category'} onClick={() => setData(d => ({ ...d, categories: d.categories.map(x => x.id === c.id ? { ...x, visible: !x.visible } : x) }))}>{c.visible ? <Eye size={17} /> : <EyeOff size={17} />}</button><button className="icon-action" title="Edit" onClick={() => setCategoryDraft(c)}><Pencil size={17} /></button><button className="icon-action danger" title="Delete" onClick={() => { if (confirm(`Delete category “${c.name}”? Projects in it will become uncategorized.`)) setData(d => ({ ...d, categories: d.categories.filter(x => x.id !== c.id), projects: d.projects.map(p => p.categoryId === c.id ? { ...p, categoryId: '' } : p) })); }}><Trash2 size={17} /></button></div>)}</section>}

      {/* --- تاب الخدمات الجديد --- */}
      {tab === 'services' && (
        <section className="admin-panel">
          <div className="panel-heading">
            <div><h3>Services</h3><p>Manage your services list.</p></div>
            <button className="admin-primary" onClick={() => setData(d => ({ ...d, services: [...(d.services || []), [String((d.services?.length || 0) + 1).padStart(2, '0'), 'New Service', 'Description']] }))}><Plus size={17} /> Add Service</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {(data.services || []).map((srv, i) => (
              <div key={i} className="settings-grid" style={{ padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
                <Field label="Number (e.g. 01)" value={srv[0]} onChange={v => { const newS = [...data.services]; newS[i][0] = v; setData(d => ({...d, services: newS})); }} />
                <Field label="Service Name" value={srv[1]} onChange={v => { const newS = [...data.services]; newS[i][1] = v; setData(d => ({...d, services: newS})); }} />
                <label className="admin-field wide"><span>Description</span><textarea rows={3} value={srv[2]} onChange={e => { const newS = [...data.services]; newS[i][2] = e.target.value; setData(d => ({...d, services: newS})); }} /></label>
                <button className="icon-action danger" style={{ width: 'fit-content' }} onClick={() => { if (confirm('Delete this service?')) setData(d => ({ ...d, services: d.services.filter((_, idx) => idx !== i) })); }}><Trash2 size={17} /> Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- تاب معرض الصور (الـ GIFs والصور) الجديد --- */}
      {tab === 'gallery' && (
        <section className="admin-panel">
          <div className="panel-heading">
            <div><h3>Gallery (Images & GIFs)</h3><p>Upload images. Format (landscape/reel) is detected automatically.</p></div>
            <button className="admin-primary" onClick={() => setData(d => ({ ...d, gallery: [{ id: crypto.randomUUID(), url: '', format: 'landscape' }, ...(d.gallery || [])] }))}><Plus size={17} /> Add Image</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {(data.gallery || []).map((img, i) => (
               <div key={img.id} style={{ padding: '15px', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ProjectImageUpload 
                    value={img.url} 
                    format={img.format}
                    onChange={(src, fmt) => {
                      const newG = [...data.gallery];
                      newG[i] = { ...newG[i], url: src, format: fmt || 'landscape' };
                      setData(d => ({ ...d, gallery: newG }));
                    }}
                    onRemove={() => { const newG = [...data.gallery]; newG[i].url = ''; setData(d => ({ ...d, gallery: newG })); }}
                  />
                  <button className="admin-outline danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { if (confirm('Delete this image?')) setData(d => ({ ...d, gallery: d.gallery.filter(g => g.id !== img.id) })); }}><Trash2 size={15} /> Delete Image</button>
               </div>
            ))}
          </div>
        </section>
      )}
      

      {tab === 'settings' && (
        <section className="admin-panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Website identity</h3>
              <p>Personalize the public portfolio.</p>
            </div>
            <span className="saved-indicator">
              <Save size={14} /> {savingCMS ? 'Saving…' : cmsLoaded ? 'Cloud auto-save' : 'Loading…'}
            </span>
          </div>

          <div className="settings-grid">
            <Field
              label="Brand / website name"
              value={data.settings.brandName}
              onChange={v => updateSettings('brandName', v)}
            />

            <Field
              label="Personal name"
              value={data.settings.name}
              onChange={v => updateSettings('name', v)}
            />

            <Field
              label="Professional title"
              value={data.settings.role}
              onChange={v => updateSettings('role', v)}
            />

            <Field
              label="Hero heading"
              value={data.settings.heroTitle}
              onChange={v => updateSettings('heroTitle', v)}
            />

            <Field
              label="Contact email"
              value={data.settings.email}
              onChange={v => updateSettings('email', v)}
            />

            {/* Hero Description */}
            <label className="admin-field wide">
              <span>Hero description</span>
              <textarea
                value={data.settings.heroBlurb}
                onChange={e => updateSettings('heroBlurb', e.target.value)}
                rows={4}
                placeholder="Write your hero description. Press Enter for a new line."
              />
              <small className="admin-help">
                Press Enter to start a new line.
              </small>
            </label>

            <label className="admin-field">
              <span>Hero font size (px)</span>
              <input
                type="number"
                min={10}
                max={36}
                value={data.settings.heroBlurbSize ?? 16}
                onChange={e =>
                  updateSettings(
                    'heroBlurbSize',
                    Math.max(10, Math.min(36, Number(e.target.value) || 16))
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>Hero text alignment</span>
              <select
                value={data.settings.heroBlurbAlign ?? 'left'}
                onChange={e =>
                  updateSettings(
                    'heroBlurbAlign',
                    e.target.value as 'left' | 'center' | 'right'
                  )
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            {/* About Me */}
            <label className="admin-field wide">
              <span>About Me text</span>
              <textarea
                value={data.settings.about}
                onChange={e => updateSettings('about', e.target.value)}
                rows={7}
                placeholder="Write your About Me text. Press Enter to create paragraphs."
              />
              <small className="admin-help">
                Use Enter to split your text into lines and paragraphs.
              </small>
            </label>

            <label className="admin-field">
              <span>About font size (px)</span>
              <input
                type="number"
                min={12}
                max={48}
                value={data.settings.aboutSize ?? 22}
                onChange={e =>
                  updateSettings(
                    'aboutSize',
                    Math.max(12, Math.min(48, Number(e.target.value) || 22))
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>About text alignment</span>
              <select
                value={data.settings.aboutAlign ?? 'center'}
                onChange={e =>
                  updateSettings(
                    'aboutAlign',
                    e.target.value as 'left' | 'center' | 'right'
                  )
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Accent color</span>
              <div className="color-field">
                <input
                  type="color"
                  value={data.settings.accent}
                  onChange={e => updateSettings('accent', e.target.value)}
                />
                <code>{data.settings.accent}</code>
              </div>
            </label>
          </div>

          <p className="admin-help">
            Changes are saved automatically to Supabase and shared with visitors across devices.
          </p>
        </section>
      )}
      
      {tab === 'cursor' && <CursorEditor settings={data.settings} updateSettings={updateSettings} setNotice={setNotice} />}
    </main>

    {projectDraft && <div className="admin-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setProjectDraft(null); }}><form className="admin-modal" onSubmit={saveProject}><div className="modal-heading"><div><span className="eyebrow">PORTFOLIO CONTENT</span><h2>{data.projects.some(p => p.id === projectDraft.id) ? 'Edit project' : 'Add project'}</h2></div><button type="button" className="icon-action" onClick={() => setProjectDraft(null)}><X /></button></div><div className="settings-grid"><Field label="Project title" value={projectDraft.name} onChange={v => setProjectDraft(p => p ? { ...p, name: v } : p)} wide /><label className="admin-field"><span>Category</span><select value={projectDraft.categoryId} onChange={e => setProjectDraft(p => p ? { ...p, categoryId: e.target.value } : p)}><option value="">Uncategorized</option>{data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="admin-field"><span>Project type</span><select value={projectDraft.type} onChange={e => setProjectDraft(p => p ? { ...p, type: e.target.value } : p)}><option>Client</option><option>Personal</option><option>Commercial</option></select></label>
        <div className="admin-field wide"><span>Project format</span><div className="format-picker"><button type="button" className={`format-option ${projectDraft.format === 'landscape' ? 'selected' : ''}`} onClick={() => setProjectDraft(p => p ? { ...p, format: 'landscape' } : p)}><RectangleHorizontal size={27} /><strong>Landscape / Long Video</strong><small>16:9 horizontal</small></button><button type="button" className={`format-option ${projectDraft.format === 'reel' ? 'selected' : ''}`} onClick={() => setProjectDraft(p => p ? { ...p, format: 'reel' } : p)}><Smartphone size={27} /><strong>Vertical Reel / Short</strong><small>9:16 vertical</small></button></div></div>
        <Field label="YouTube URL" value={projectDraft.youtubeUrl} onChange={v => setProjectDraft(p => p ? { ...p, youtubeUrl: v } : p)} wide placeholder="https://www.youtube.com/watch?v=..." />
        
        {/* Cover Image Upload */}
        <ProjectImageUpload value={projectDraft.coverUrl} onChange={(src, format) => setProjectDraft(p => p ? { ...p, coverUrl: src, format: format || p.format } : p)} onRemove={() => setProjectDraft(p => p ? { ...p, coverUrl: '' } : p)} format={projectDraft.format} />
        
        {/* Gallery / Extra Images in Project Modal */}
        <div className="admin-field wide">
          <span>Additional Images</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {projectDraft.images.map((img, index) => (
              <div key={index} style={{ padding: '10px', border: '1px dashed #555', borderRadius: '8px' }}>
                <ProjectImageUpload 
                  value={img} 
                  format={projectDraft.format}
                  onChange={(src) => setProjectDraft(p => {
                    if (!p) return p;
                    const newImages = [...p.images];
                    newImages[index] = src;
                    return { ...p, images: newImages };
                  })} 
                  onRemove={() => setProjectDraft(p => {
                    if (!p) return p;
                    const newImages = [...p.images];
                    if (newImages.length === 1) newImages[0] = ''; else newImages.splice(index, 1);
                    return { ...p, images: newImages };
                  })} 
                />
              </div>
            ))}
            <button type="button" className="admin-outline" onClick={() => setProjectDraft(p => p ? { ...p, images: [...p.images, ''] } : p)} style={{ width: 'fit-content' }}><Plus size={16} /> Add Image</button>
          </div>
        </div>

        <label className="admin-field wide"><span>Description</span><textarea rows={3} value={projectDraft.description} onChange={e => setProjectDraft(p => p ? { ...p, description: e.target.value } : p)} /></label><label className="admin-check"><input type="checkbox" checked={projectDraft.featured} onChange={e => setProjectDraft(p => p ? { ...p, featured: e.target.checked } : p)} /> Featured project</label><label className="admin-check"><input type="checkbox" checked={projectDraft.published} onChange={e => setProjectDraft(p => p ? { ...p, published: e.target.checked } : p)} /> Published on website</label></div>{projectDraft.youtubeUrl && youtubeThumbnail(projectDraft.youtubeUrl) && <div className="video-preview"><img src={youtubeThumbnail(projectDraft.youtubeUrl)} alt="YouTube thumbnail preview" /><span><Youtube size={17} /> YouTube thumbnail preview</span></div>}<div className="modal-actions"><button type="button" className="admin-outline" onClick={() => setProjectDraft(null)}>Cancel</button><button type="submit" className="admin-primary"><Save size={16} /> Save project</button></div></form></div>}
    
    {categoryDraft && <div className="admin-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCategoryDraft(null); }}><form className="admin-modal small-modal" onSubmit={saveCategory}><div className="modal-heading"><div><span className="eyebrow">PROJECT ORGANIZATION</span><h2>{data.categories.some(c => c.id === categoryDraft.id) ? 'Edit category' : 'New category'}</h2></div><button type="button" className="icon-action" onClick={() => setCategoryDraft(null)}><X /></button></div><Field label="Category name" value={categoryDraft.name} onChange={v => setCategoryDraft(c => c ? { ...c, name: v, id: data.categories.some(x => x.id === c.id) ? c.id : slug(v) } : c)} placeholder="e.g. Color Grading" wide /><label className="admin-check"><input type="checkbox" checked={categoryDraft.visible} onChange={e => setCategoryDraft(c => c ? { ...c, visible: e.target.checked } : c)} /> Visible in portfolio filters</label><div className="modal-actions"><button type="button" className="admin-outline" onClick={() => setCategoryDraft(null)}>Cancel</button><button type="submit" className="admin-primary"><Save size={16} /> Save category</button></div></form></div>}
  </div>;
}

function CursorEditor({ settings, updateSettings, setNotice }: { settings: CMSData['settings']; updateSettings: <K extends keyof CMSData['settings']>(key: K, value: CMSData['settings'][K]) => void; setNotice: (message: string) => void }) {
  const [selectedPath, setSelectedPath] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const svg = sanitizeSvg(settings.cursorSvg);
  const paths = getSvgPaths(svg);
  const originalPaths = getSvgPaths(settings.cursorOriginalSvg);
  const currentPath = paths[selectedPath];
  const changePath = (changes: Partial<SvgPathAttributes>) => updateSettings('cursorSvg', updateSvgPath(svg, selectedPath, changes));
  
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadError('');
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') { setUploadError('Please choose an SVG file.'); e.target.value = ''; return; }
    if (file.size > 250 * 1024) { setUploadError('SVG files must be smaller than 250 KB.'); e.target.value = ''; return; }
    try {
      const cleaned = sanitizeSvg(await file.text());
      if (!cleaned) { setUploadError('This SVG is invalid or contains unsupported content. Try exporting it again as a plain SVG.'); e.target.value = ''; return; }
      updateSettings('cursorSvg', cleaned); updateSettings('cursorOriginalSvg', cleaned); setSelectedPath(0); setNotice('SVG cursor uploaded and sanitized.');
    } catch { setUploadError('Could not read this SVG file.'); }
    e.target.value = '';
  };
  
  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'honda-custom-cursor.svg'; a.click(); URL.revokeObjectURL(url);
  };
  
  const restorePath = () => {
    const original = originalPaths[selectedPath]; if (!original) return;
    changePath(original); setNotice('Selected SVG path restored to the uploaded original.');
  };
  
  return <>
    <section className="admin-panel cursor-settings-panel"><div className="panel-heading"><div><h3>Custom SVG cursor</h3><p>Upload a cursor, edit individual SVG paths, and preview your changes.</p></div><span className="saved-indicator"><Save size={14} /> {savingCMS ? 'Saving…' : cmsLoaded ? 'Cloud auto-save' : 'Loading…'}</span></div>
      <div className="cursor-toolbar"><label className="admin-primary cursor-upload"><Upload size={16} /> Upload SVG<input type="file" accept="image/svg+xml,.svg" onChange={handleUpload} /></label><button type="button" className="admin-outline" onClick={downloadSvg} disabled={!svg}><Download size={15} /> Export SVG</button><button type="button" className="admin-outline" onClick={() => { if (settings.cursorOriginalSvg) { updateSettings('cursorSvg', settings.cursorOriginalSvg); setSelectedPath(0); setNotice('Original uploaded SVG restored.'); } }} disabled={!settings.cursorOriginalSvg}><RotateCcw size={15} /> Restore original</button></div>
      {uploadError && <p className="cursor-error" role="alert">{uploadError}</p>}
      <div className="cursor-preview-grid"><div className="cursor-preview-card"><span className="cursor-subtitle">LIVE PREVIEW</span><div className="svg-preview-stage">{svg ? <div className="svg-preview-art" style={{ transform: `rotate(${settings.cursorRotation}deg)` }} dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="cursor-empty"><MousePointer2 size={38} /><span>Upload an SVG to start</span></div>}</div><p className="admin-help">Preview uses the sanitized SVG. Embedded scripts and external references are removed.</p></div>
        <div className="cursor-control-card"><label className="admin-check cursor-enabled-check"><input type="checkbox" checked={settings.cursorEnabled} onChange={e => updateSettings('cursorEnabled', e.target.checked)} disabled={!svg} /> Enable on public portfolio</label><div className="settings-grid"><label className="admin-field"><span>Hotspot X (0–64)</span><input type="number" min={0} max={64} value={settings.cursorHotspotX} onChange={e => updateSettings('cursorHotspotX', Math.max(0, Math.min(64, Number(e.target.value))))} /></label><label className="admin-field"><span>Hotspot Y (0–64)</span><input type="number" min={0} max={64} value={settings.cursorHotspotY} onChange={e => updateSettings('cursorHotspotY', Math.max(0, Math.min(64, Number(e.target.value))))} /></label><label className="admin-field"><span>Cursor rotation (degrees)</span><input type="number" min={-360} max={360} step={15} value={settings.cursorRotation} onChange={e => updateSettings('cursorRotation', Math.max(-360, Math.min(360, Number(e.target.value))))} /><span className="admin-help">Try 90°, 180°, or 270°.</span></label></div><p className="admin-help">The cursor is disabled on touch-only devices and in the dashboard. Text fields keep their normal text cursor.</p></div>
      </div>
    </section>
    <section className="admin-panel"><div className="panel-heading"><div><h3>SVG path editor</h3><p>Edit actual path geometry and styling. Changes update the preview immediately.</p></div><span className="cursor-path-count">{paths.length} paths</span></div>
      {!svg ? <div className="admin-empty">Upload a valid SVG file to edit its paths.</div> : paths.length === 0 ? <div className="admin-empty">This SVG contains no path elements. Upload an SVG with editable paths.</div> : <div className="svg-editor-layout"><div className="svg-path-list" role="listbox" aria-label="SVG paths">{paths.map((path, i) => <button type="button" key={i} className={`svg-path-item ${selectedPath === i ? 'selected' : ''}`} onClick={() => setSelectedPath(i)}><span className="svg-path-icon" style={{ background: path.fill === 'none' ? 'transparent' : path.fill }} /><span><strong>Path {String(i + 1).padStart(2, '0')}</strong><small>{path.d.slice(0, 36) || 'Empty path'}{path.d.length > 36 ? '…' : ''}</small></span></button>)}</div>
        {currentPath && <div className="svg-path-fields"><div className="svg-path-heading"><h4>Edit path {selectedPath + 1}</h4><button type="button" className="admin-outline" onClick={restorePath} disabled={!originalPaths[selectedPath]}><RotateCcw size={14} /> Reset path</button></div><label className="admin-field wide"><span>Path geometry (d)</span><textarea className="svg-path-d" rows={5} spellCheck={false} value={currentPath.d} onChange={e => changePath({ d: e.target.value })} /></label><div className="settings-grid"><label className="admin-field"><span>Fill</span><div className="svg-color-row"><input aria-label="Fill color" type="color" value={toHex(currentPath.fill)} onChange={e => changePath({ fill: e.target.value })} /><input value={currentPath.fill} onChange={e => changePath({ fill: e.target.value })} /></div></label><label className="admin-field"><span>Stroke</span><div className="svg-color-row"><input aria-label="Stroke color" type="color" value={toHex(currentPath.stroke)} onChange={e => changePath({ stroke: e.target.value })} /><input value={currentPath.stroke} onChange={e => changePath({ stroke: e.target.value })} /></div></label><label className="admin-field"><span>Stroke width</span><input type="number" min={0} max={100} step={0.25} value={Number(currentPath.strokeWidth) || 0} onChange={e => changePath({ strokeWidth: e.target.value })} /></label><label className="admin-field"><span>Opacity (0–1)</span><input type="number" min={0} max={1} step={0.05} value={Number(currentPath.opacity) || 0} onChange={e => changePath({ opacity: e.target.value })} /></label></div><p className="admin-help">The geometry field edits the actual SVG <code>d</code> attribute. Keep the SVG's viewBox and transforms intact for predictable results.</p></div>}
      </div>}
    </section>
  </>;
}

function toHex(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  return '#ffffff';
}

function ProjectImageUpload({ value, onChange, onRemove, format }: { value: string; onChange: (src: string, format?: Project['format']) => void; onRemove: () => void; format: Project['format'] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('اختار ملف صورة من فضلك.'); return; }
    setBusy(true); setError('');
    try {
      const result = await compressImageForUpload(file);
      const path = `portfolio/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(path, result.blob, { contentType: 'image/webp', upsert: false, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from('portfolio-images').getPublicUrl(path);
      onChange(publicUrl.publicUrl, result.width > result.height ? 'landscape' : 'reel');
    } catch (err) {
      console.error('Supabase image upload failed:', err);
      setError(err instanceof Error ? `فشل رفع الصورة: ${err.message}` : 'فشل رفع الصورة. تأكد من إعداد Supabase Storage.');
    } finally { setBusy(false); }
  };
  return <div className="admin-field wide project-image-upload"><span>Image / Cover Upload</span>
    <p className="admin-upload-help">Upload from device. Format is detected automatically (Landscape or Vertical).</p>
    <label className="admin-upload-button"><Upload size={17} /> {busy ? 'Preparing image…' : value ? 'Replace image' : 'Choose image from device'}<input type="file" accept="image/*" onChange={handleFile} disabled={busy} /></label>
    {value && <div className={`project-upload-preview ${format === 'reel' ? 'portrait' : 'landscape'}`}><img src={value} alt="Preview" /><div className="project-upload-meta"><strong>{format === 'reel' ? 'Vertical image · 9:16 layout' : 'Landscape image · 16:9 layout'}</strong><button type="button" className="admin-text-button" onClick={onRemove}>Remove image</button></div></div>}
    {error && <span className="admin-upload-error">{error}</span>}
  </div>;
}

async function compressImageForUpload(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Invalid image')); });
    const maxSide = 1200;
    const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error('Image compression failed')), 'image/webp', 0.78);
    });
    if (blob.size > 8 * 1024 * 1024) throw new Error('Image too large after compression');
    return { blob, width, height };
  } finally { URL.revokeObjectURL(objectUrl); }
}

function Field({ label, value, onChange, placeholder, wide }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) { return <label className={`admin-field ${wide ? 'wide' : ''}`}><span>{label}</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function ProjectRow({ project, category, onEdit, onToggle, onDelete }: { project: Project; category: string; onEdit: () => void; onToggle: () => void; onDelete?: () => void }) { const thumb = project.coverUrl || youtubeThumbnail(project.youtubeUrl); return <div className="project-row"><div className="project-thumb">{thumb ? <img src={thumb} loading="lazy" alt="" /> : <MonitorPlay size={22} />}</div><div className="project-row-info"><strong>{project.name || 'Untitled project'}</strong><span>{category} · {project.type} · {project.format === 'reel' ? '9:16 Reel' : '16:9 Landscape'}</span></div>{project.youtubeUrl && <span className="youtube-chip"><Youtube size={13} /> YouTube</span>}<span className={`publish-chip ${project.published ? 'is-published' : ''}`}>{project.published ? 'Published' : 'Draft'}</span><button className="icon-action" title={project.published ? 'Unpublish' : 'Publish'} onClick={onToggle}>{project.published ? <Eye size={17} /> : <EyeOff size={17} />}</button><button className="icon-action" title="Edit" onClick={onEdit}><Pencil size={17} /></button>{onDelete && <button className="icon-action danger" title="Delete" onClick={onDelete}><Trash2 size={17} /></button>}</div>; }
