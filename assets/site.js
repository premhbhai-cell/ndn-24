(function(){
  var d=document;
  var t=d.getElementById('today');
  if(t){t.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});}
  var sb=d.getElementById('sbtn'),box=d.getElementById('sbox');
  if(sb&&box){sb.addEventListener('click',function(){box.classList.toggle('open');var i=box.querySelector('input');if(i)i.focus();});}
  var bb=d.getElementById('bbtn'),m=d.getElementById('menu');
  if(bb&&m){bb.addEventListener('click',function(){m.classList.toggle('open');});}
  var tt=d.getElementById('trendtxt');
  if(tt){
    var items=[].slice.call(d.querySelectorAll('.tile h3')).map(function(h){return h.textContent;});
    var extra=[].slice.call(d.querySelectorAll('.card h3 a')).map(function(h){return h.textContent;});
    items=items.concat(extra).filter(function(v,i,a){return a.indexOf(v)===i;}).slice(0,6);
    var k=0;function show(n){if(!items.length)return;k=(n+items.length)%items.length;tt.textContent=items[k];}
    var p=d.getElementById('tprev'),n=d.getElementById('tnext');
    if(p)p.addEventListener('click',function(){show(k-1);});
    if(n)n.addEventListener('click',function(){show(k+1);});
    if(items.length&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(function(){show(k+1);},5000);
  }
  var up=d.getElementById('totop');
  if(up){window.addEventListener('scroll',function(){up.classList.toggle('show',window.scrollY>400);});up.addEventListener('click',function(){window.scrollTo({top:0});});}
})();

/* NDN24 language switcher
   English is the default. The selected language is remembered across every page.
   On a hosted site (http/https), Google Translate translates the complete visible
   page, including navbar, articles, footer, menus, buttons and labels.
   Hindi has a bundled static version for offline/local use.
*/
(function(){
  var d=document;
  var btn=d.getElementById('langbtn'), list=d.getElementById('langlist');
  if(!btn||!list)return;

  var langs={hi:'HI',en:'EN',or:'OD',bn:'BN',gu:'GU',pa:'PA',ta:'TA',te:'TE',mr:'MR',kn:'KN',ml:'ML'};
  var flags={hi:'in',en:'uk',or:'in',bn:'bd',gu:'in',pa:'in',ta:'in',te:'in',mr:'in',kn:'in',ml:'in'};
  var fileName=(location.pathname.split('/').pop()||'index.html');
  var path=location.pathname.replace(/\\/g,'/');
  var isHindiPath=/(^|\/)hi\//i.test(path);
  var current='en';
  try{current=localStorage.getItem('lang')||'en';}catch(e){}
  if(isHindiPath)current='hi';
  if(!langs[current])current='en';

  function updateButton(lang){
    var code=d.getElementById('langcode'),fl=d.getElementById('langfl');
    if(code)code.textContent=langs[lang]||'EN';
    if(fl)fl.className='fl fl-'+(flags[lang]||'uk');
    d.documentElement.lang=lang;
  }
  updateButton(current);

  function close(){list.hidden=true;btn.setAttribute('aria-expanded','false');}
  function open(){list.hidden=false;btn.setAttribute('aria-expanded','true');}
  btn.addEventListener('click',function(e){e.stopPropagation();list.hidden?open():close();});
  d.addEventListener('click',function(){close();});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')close();});

  function save(lang){try{localStorage.setItem('lang',lang);}catch(e){}}

  function setGoogleCookie(lang){
    var value='/en/'+lang;
    var expires='; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    d.cookie='googtrans='+value+'; path=/'+expires;
    if(location.hostname && location.hostname.indexOf('.')>-1){
      var host=location.hostname.replace(/^www\./,'');
      d.cookie='googtrans='+value+'; path=/; domain='+host+expires;
      d.cookie='googtrans='+value+'; path=/; domain=.'+host+expires;
    }
  }

  function goHindi(){
    save('hi');
    if(isHindiPath)return;
    location.href='hi/'+fileName;
  }

  function goEnglish(){
    save('en');
    // Clear Google Translate cookie so the complete site returns to English.
    d.cookie='googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    if(isHindiPath){location.href='../'+fileName;}
    else{location.reload();}
  }

  function activateGoogle(lang){
    save(lang);
    setGoogleCookie(lang);
    // Reloading is intentional: Google Translate then initializes from the
    // persisted googtrans cookie on the fresh page. This is much more reliable
    // across navbar/page navigation than changing a hidden select manually.
    location.reload();
  }

  function setLang(lang){
    close();
    updateButton(lang);
    if(lang==='en')return goEnglish();
    if(lang==='hi')return goHindi();
    if(location.protocol==='http:'||location.protocol==='https:')return activateGoogle(lang);
    // Local HTML cannot run Google's full-page translator because the browser
    // blocks the external translation iframe/script from a file:// origin.
    // Keep the selection so it becomes active automatically once hosted.
    save(lang);
    alert('Full-page translation for this language works when the website is opened from a web server (http/https). Hindi is available offline.');
  }

  list.addEventListener('click',function(e){
    var item=e.target.closest('li');
    if(item)setLang(item.getAttribute('data-l'));
  });
  list.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){
      var item=e.target.closest('li');
      if(item){e.preventDefault();setLang(item.getAttribute('data-l'));}
    }
  });

  // Keep the selected language when moving through navbar/footer/article links.
  // Google Translate itself uses the cookie; this also ensures static Hindi pages
  // remain inside /hi/ instead of jumping back to English.
  if(isHindiPath){
    d.querySelectorAll('a[href]').forEach(function(a){
      var href=a.getAttribute('href');
      if(!href || href[0]==='#' || /^(https?:|mailto:|tel:|javascript:)/i.test(href))return;
      if(href.indexOf('../')===0 || href.indexOf('hi/')===0)return;
      if(/\.html(?:[?#].*)?$/i.test(href))a.setAttribute('href','../'+href);
    });
  }

  // On hosted pages, if a language was already selected, ensure Google gets
  // the cookie before its own widget starts.
  if(!isHindiPath && current!=='en' && (location.protocol==='http:'||location.protocol==='https:')){
    setGoogleCookie(current);
    if(!d.getElementById('ndn-google-script')){
      var sc=d.createElement('script');
      sc.id='ndn-google-script';
      sc.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      sc.async=true;
      window.googleTranslateElementInit=function(){
        try{
          new google.translate.TranslateElement({
            pageLanguage:'en',
            includedLanguages:'hi,or,bn,gu,pa,ta,te,mr,kn,ml,en',
            autoDisplay:false,
            multilanguagePage:true
          },'google_translate_element');
        }catch(e){}
      };
      d.body.appendChild(sc);
    }
  }
})();
