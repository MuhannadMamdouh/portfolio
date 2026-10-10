import { createContext, useContext, useRef, useState, useEffect, type ReactNode, type MouseEvent } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import Admin from './Admin';
import { supabase } from './supabase';
import {
  readCMS,
  youtubeThumbnail,
  youtubeId,
  sanitizeSvg,
  type Project as CMSProject,
  type SiteSettings,
  type CMSData,
} from './cms';

const asset = 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/';

const CMSContext = createContext<CMSData | null>(null);

function useCMS(): CMSData {
  const data = useContext(CMSContext);

  if (!data) {
    throw new Error('CMS data is not available');
  }

  return data;
}

function FadeIn({children, delay=0, duration=.7, x=0, y=30, className=''}:{children:ReactNode;delay?:number;duration?:number;x?:number;y?:number;className?:string}) {
 return <motion.div className={className} initial={{opacity:0,x,y}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,margin:'50px',amount:0}} transition={{delay,duration,ease:[.25,.1,.25,1]}}>{children}</motion.div>;
}

function ContactButton({ phone = '201556745183' }: { phone?: string }) {
 const message = "Hello Muhannad! I saw your portfolio and would like to discuss a project with you.";
 const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
 return (
   <a className="contact-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
     Contact Me <ArrowUpRight size={18} />
   </a>
 );
}

function Magnet({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null); const mx=useMotionValue(0), my=useMotionValue(0); const sx=useSpring(mx,{stiffness:140,damping:18}), sy=useSpring(my,{stiffness:140,damping:18});
 const move=(e:MouseEvent<HTMLDivElement>)=>{const r=ref.current?.getBoundingClientRect();if(!r)return;const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.abs(dx)<r.width/2+150&&Math.abs(dy)<r.height/2+150){mx.set(dx/3);my.set(dy/3)}};
 const reset=()=>{mx.set(0);my.set(0)};
 return <motion.div ref={ref} onMouseMove={move} onMouseLeave={reset} style={{x:sx,y:sy,willChange:'transform'}}>{children}</motion.div>
}


function Hero() {
  const { settings } = useCMS();

  return (
    <section id="home" className="hero section-dark">
      <FadeIn className="navbar" y={-20}>
        <a href="#about">About</a>
        <a href="#services">Price</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </FadeIn>

      <div className="hero-title-wrap">
        <FadeIn delay={0.15} y={40} className="hero-title-motion">
          <h1 className="hero-heading">{settings.heroTitle}</h1>
        </FadeIn>
      </div>

      <div className="hero-portrait">
        <FadeIn delay={0.6} y={30}>
          <Magnet>
            <img src="photo.png" alt="HONDA portfolio portrait" />
          </Magnet>
        </FadeIn>
      </div>

      <div className="hero-bottom">
        <FadeIn delay={0.35} y={20}>
          <p
            className="hero-blurb"
            style={{
  fontSize: `clamp(10px, ${settings.heroBlurbSize ?? 16}px, 36px)`,
  textAlign: settings.heroBlurbAlign ?? 'center',
  whiteSpace: 'pre-line',
  width: '100%',
  maxWidth: '900px',
  margin: '0 auto',
}}
          >
            {settings.heroBlurb}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}


function Marquee() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  // بنقرأ الصور (Gallery) من الـ CMS بدال الـ Array القديم الثابت
  const { gallery } = useCMS();
  
  useEffect(() => {
    const fn = () => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * .3);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // بنقسم الصور لصفين زي ما كان معمول
  const mid = Math.ceil(gallery.length / 2) || 1;
  const row1 = gallery.slice(0, mid);
  const row2 = gallery.slice(mid);

  // عملنا دالة بسيطة عشان ترسم الصور بكلاس بيحدد شكلها طولي ولا عرضي
  const renderImages = (items: typeof gallery) => {
    return items.map((img, i) => (
      <img 
        key={i} 
        src={img.url} 
        loading="lazy" 
        className={img.format === 'reel' ? 'gallery-reel' : 'gallery-landscape'}
        alt="Digital design project" 
        style={{
          borderRadius: '12px',
          objectFit: 'cover',
          // لو طولي (Reel) هنخلي العرض أقل والطول أكبر، ولو لاندسكيب هيبقى العكس عشان يبقوا لايقين
          width: img.format === 'reel' ? '180px' : '320px', 
          height: img.format === 'reel' ? '320px' : '200px',
          margin: '0 10px'
        }}
      />
    ));
  };

  if (gallery.length === 0) return null; // لو مفيش صور مرفوعة لسه في الداش بورد مش هيعرض حاجة

  return (
    <section ref={ref} className="marquee-section section-dark">
      <div className="marquee-row" style={{ transform: `translateX(${offset - 200}px)`, display: 'flex', alignItems: 'center' }}>
        {[...row1, ...row1, ...row1].map((img, i) => renderImages([img]))}
      </div>
      <div className="marquee-row" style={{ transform: `translateX(-${offset - 200}px)`, display: 'flex', alignItems: 'center' }}>
        {[...row2, ...row2, ...row2].map((img, i) => renderImages([img]))}
      </div>
    </section>
  );
}


function AnimatedText({
  text,
  size = 22,
  align = 'center',
}: {
  text: string;
  size?: number;
  align?: 'left' | 'center' | 'right';
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  return (
    <p
      ref={ref}
      className="animated-copy"
      style={{
        fontSize: `clamp(12px, ${size}px, 48px)`,
        textAlign: align,
        whiteSpace: 'pre-wrap',
      }}
    >
      {text.split('').map((char, i) => (
        <Letter
          key={i}
          char={char}
          index={i}
          total={text.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

function Letter({char,index,total,progress}:{char:string;index:number;total:number;progress:ReturnType<typeof useScroll>['scrollYProgress']}){const start=index/total,end=start+1/total;const opacity=useTransform(progress,[start,end],[.2,1]);return <span className="letter"><span aria-hidden="true">{char===' '?'\u00a0':char}</span><motion.span className="letter-overlay" style={{opacity}}>{char===' '?'\u00a0':char}</motion.span></span>}


function About() {
  const { settings } = useCMS();

  return (
    <section id="about" className="about-section section-dark">
      <motion.img
        className="decor moon"
        src={asset + 'moon_icon.11395d36.png'}
        alt=""
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.9 }}
      />

      <motion.img
        className="decor object-left"
        src={asset + 'p59_1.4659672e.png'}
        alt=""
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.9 }}
      />

      <motion.img
        className="decor lego"
        src={asset + 'lego_icon-1.703bb594.png'}
        alt=""
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.9 }}
      />

      <motion.img
        className="decor object-right"
        src={asset + 'Group_134-1.2e04f3ce.png'}
        alt=""
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.9 }}
      />

      <div className="about-content">
        <FadeIn>
          <h2 className="hero-heading section-heading">About me</h2>
        </FadeIn>

       <div className="about-copy" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
  <AnimatedText
    text={settings.about}
    size={settings.aboutSize ?? 22}
    align={settings.aboutAlign ?? 'center'}
  />
</div>

        <FadeIn delay={0.15}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

function Services() {
  // بنسحب الخدمات من الـ CMS بدال المكتوبة في الكود الثابت
  const { services: servicesData } = useCMS();
  
  if (servicesData.length === 0) return null;

  return (
    <section id="services" className="services-section">
      <FadeIn><h2 className="section-heading dark-heading">S e rvic e s</h2></FadeIn>
      <div className="services-list">
        {servicesData.map(([num, name, desc], i) => (
          <FadeIn key={num + i} delay={i * .1} className="service-item">
            <div className="service-number">{num}</div>
            <div className="service-copy">
              <h3>{name}</h3>
              <p>{desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function DynamicProjectCard({project,index,categories}:{project:CMSProject;index:number;categories:{id:string;name:string}[]}){
  const { settings } = useCMS();
 const ref=useRef<HTMLDivElement>(null);
 const [videoOpen,setVideoOpen]=useState(false);
 const {scrollYProgress}=useScroll({target:ref,offset:['start end','start start']});
 const scale=useTransform(scrollYProgress,[0,1],[1,1-(2-index)*.03]);
 const videoThumb=youtubeThumbnail(project.youtubeUrl);
 const videoId=youtubeId(project.youtubeUrl);
 const isReel=project.format==='reel';
 const images=[project.images?.[0]||project.coverUrl,project.images?.[1]||project.coverUrl,project.coverUrl||videoThumb];
 const coverImage=project.coverUrl||videoThumb||images[0]||'';
 useEffect(()=>{
  if(!videoOpen)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setVideoOpen(false)};
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  window.addEventListener('keydown',onKey);
  return()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow};
 },[videoOpen]);
 const openVideo=()=>{if(videoId)setVideoOpen(true)};
 return <div ref={ref} className={`project-card-wrap ${isReel?'project-card-wrap-reel':''}`} style={{top:`${96+index*28}px`}}>
  <motion.article className={`project-card ${isReel?'project-card-reel':''}`} style={{scale}}>
   <div className="project-top"><div className="project-ident"><span className="project-number">{String(index+1).padStart(2,'0')}</span><div><span className="project-type">{categories.find(c=>c.id===project.categoryId)?.name||project.type} / {isReel?'Vertical Reel':'Landscape Video'}</span><h3>{project.name}</h3><p className="dynamic-project-desc">{project.description}</p></div></div>
    {videoId?<button type="button" className="live-button video-open-button" onClick={openVideo}>Watch video <Play size={16} fill="currentColor"/></button>:<a className="live-button" href={`mailto:${settings.email}?subject=${encodeURIComponent(`Project enquiry: ${project.name}`)}`}>Project enquiry <ArrowUpRight size={17}/></a>}
   </div>
   <div className={`project-gallery ${isReel?'is-reel':'is-landscape'}`}>
    <button type="button" disabled={!videoId} className={`project-video-visual ${isReel?'reel-media':''}`} onClick={openVideo} aria-label={videoId?`Play ${project.name} video`:`View ${project.name} project`}>
     <img className="project-tall-image" src={coverImage} loading="lazy" alt={`${project.name} ${isReel?'reel cover':'video cover'}`}/>
     {videoId&&<span className="play-badge"><Play fill="currentColor"/></span>}
    </button>
   </div>
  </motion.article>
  {videoOpen&&videoId&&<div className="video-modal-backdrop" role="presentation" onClick={()=>setVideoOpen(false)}><div className="video-modal" role="dialog" aria-modal="true" aria-label={`${project.name} video`} onClick={e=>e.stopPropagation()}><div className="video-modal-top"><span>{project.name}</span><button type="button" onClick={()=>setVideoOpen(false)} aria-label="Close video">×</button></div><div className={`video-frame-wrap ${isReel?'video-frame-reel':''}`}><iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`} title={project.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div></div></div>}
 </div>;
}

function Projects(){
 const cms = useCMS();
 const [active,setActive]=useState('all');
 const categories=cms.categories.filter(c=>c.visible);
 const visibleProjects=cms.projects.filter(p=>p.published&&(active==='all'||p.categoryId===active));
 return <section id="projects" className="projects-section"><FadeIn><h2 className="hero-heading section-heading">Selected  W o r k</h2></FadeIn><div className="project-filters"><button className={active==='all'?'selected':''} onClick={()=>setActive('all')}>All work</button>{categories.map(c=><button key={c.id} className={active===c.id?'selected':''} onClick={()=>setActive(c.id)}>{c.name}</button>)}</div><div className="projects-stack">{visibleProjects.map((p,i)=><DynamicProjectCard key={p.id} project={p} index={i} categories={categories}/>)}{visibleProjects.length===0&&<p className="no-projects">No published projects in this category yet.</p>}</div><footer id="contact" className="footer"><FadeIn><p>HAVE A GOOD IDEA?</p><a href={`mailto:${cms.settings.email}`} className="footer-link">Let&apos;s make it real <ArrowUpRight/></a><div className="footer-bottom"><span>© 2026 {cms.settings.brandName.toUpperCase()} — {cms.settings.name.toUpperCase()} · {cms.settings.role.toUpperCase()}</span><a href="#home">BACK TO TOP ↑</a><a href="/admin">ADMIN</a></div></FadeIn></footer></section>
}

function CustomCursor({settings}:{settings:SiteSettings}){
 const cursorRef=useRef<HTMLDivElement>(null);
 const svg=sanitizeSvg(settings.cursorSvg);
 useEffect(()=>{
  if(!settings.cursorEnabled||!svg)return;
  const media=window.matchMedia('(pointer: fine)');
  if(!media.matches)return;
  const body=document.body;
  body.classList.add('custom-cursor-active');
  let frame=0;
  const node=cursorRef.current;
  const move=(event:globalThis.MouseEvent)=>{
   if(!node)return;
   cancelAnimationFrame(frame);
   const target=event.target as HTMLElement|null;
   const editing=!!target?.closest('input,textarea,select,[contenteditable="true"],.allow-native-cursor');
   frame=requestAnimationFrame(()=>{
    if(!node)return;
    node.style.opacity=editing?'0':'1';
    node.style.transform = `translate3d(${event.clientX - settings.cursorHotspotX}px, ${event.clientY - settings.cursorHotspotY}px, 0)`;

    const cursorArt = node.firstElementChild as HTMLElement | null;
    if (cursorArt) {
      cursorArt.style.transform = `rotate(${settings.cursorRotation}deg)`;
      cursorArt.style.transformOrigin = 'top left';
    }
   });
  };
  const leave=()=>{if(node)node.style.opacity='0'};
  window.addEventListener('mousemove',move,{passive:true});
  document.documentElement.addEventListener('mouseleave',leave);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('mousemove',move);document.documentElement.removeEventListener('mouseleave',leave);body.classList.remove('custom-cursor-active')};
 },[settings.cursorEnabled,settings.cursorHotspotX,settings.cursorHotspotY,settings.cursorRotation,svg]);
 if(!settings.cursorEnabled||!svg)return null;
 return <div ref={cursorRef} className="custom-cursor-overlay" aria-hidden="true"><div dangerouslySetInnerHTML={{__html:svg}}/></div>;
}


export default function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin';
  const [cms, setCms] = useState<CMSData>(() => readCMS());

  useEffect(() => {
    if (isAdmin) return;

    let cancelled = false;

    async function loadCMS() {
      try {
        const { data: row, error } = await supabase
          .from('portfolio_content')
          .select('content')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;
        if (cancelled || !row?.content) return;

        const remote = row.content as Partial<CMSData>;
        const fallback = readCMS();

        const merged: CMSData = {
          ...fallback,
          ...remote,
          settings: {
            ...fallback.settings,
            ...(remote.settings || {}),
          },
          categories: Array.isArray(remote.categories)
            ? remote.categories
            : fallback.categories,
          projects: Array.isArray(remote.projects)
            ? remote.projects
            : fallback.projects,
          services: Array.isArray(remote.services)
            ? remote.services
            : fallback.services,
          gallery: Array.isArray(remote.gallery)
            ? remote.gallery
            : fallback.gallery,
        };

        setCms(merged);
      } catch (error) {
        console.error(
          'Could not load portfolio data from Supabase:',
          error
        );
      }
    }

    void loadCMS();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    document.title = `${cms.settings.brandName} — ${cms.settings.name} | ${cms.settings.role}`;

    document.documentElement.style.setProperty(
      '--brand-accent',
      cms.settings.accent
    );
  }, [isAdmin, cms.settings]);

  if (isAdmin) return <Admin />;

  return (
    <CMSContext.Provider value={cms}>
      <main className="page-shell">
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <CustomCursor settings={cms.settings} />
      </main>
    </CMSContext.Provider>
  );
}
