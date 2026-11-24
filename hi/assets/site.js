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
   - English is the default.
   - Hindi has a complete offline/static version under /hi/ so it also works when opening index.html directly.
   - Other languages use Google Translate when the site is hosted over http/https.
   - Language choice is persisted in localStorage so it survives page changes. */
(function(){
  var d=document, BASE='en';
  var btn=d.getElementById('langbtn'), list=d.getElementById('langlist');
  if(!btn||!list)return;

  var langs={hi:'HI',en:'EN',or:'OD',bn:'BN',gu:'GU',pa:'PA',ta:'TA',te:'TE',mr:'MR',kn:'KN',ml:'ML'};
  var flags={hi:'in',en:'uk',or:'in',bn:'bd',gu:'in',pa:'in',ta:'in',te:'in',mr:'in',kn:'in',ml:'in'};
  var fileName=(location.pathname.split('/').pop()||'index.html');
  var isHindiPath=/(^|\/)hi\//i.test(location.pathname.replace(/\\/g,'/'));
  var current=localStorage.getItem('lang')|| (isHindiPath?'hi':'en');
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
  d.addEventListener('click',close);
  d.addEventListener('keydown',function(e){if(e.key==='Escape')close();});

  function goStaticHindi(){
    var target='hi/'+fileName;
    try{localStorage.setItem('lang','hi');}catch(e){}
    location.href=target;
  }
  function goEnglish(){
    try{localStorage.setItem('lang','en');}catch(e){}
    if(isHindiPath){location.href='../'+fileName;}else{location.reload();}
  }

  function setGoogleCookie(lang){
    var value='/en/'+lang;
    var expires='; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    d.cookie='googtrans='+value+'; path=/'+expires;
    if(location.hostname && location.hostname.indexOf('.')>-1){
      d.cookie='googtrans='+value+'; path=/; domain='+location.hostname+expires;
      d.cookie='googtrans='+value+'; path=/; domain=.'+location.hostname.replace(/^www\./,'')+expires;
    }
  }

  function loadGoogle(lang){
    window.__ndnTargetLang=lang;
    setGoogleCookie(lang);
    var old=d.getElementById('ndn-google-script');
    if(old)old.remove();
    window.googleTranslateElementInit=function(){
      try{
        new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'hi,or,bn,gu,pa,ta,te,mr,kn,ml,en',autoDisplay:false},'google_translate_element');
      }catch(e){return;}
      var tries=0;
      var timer=setInterval(function(){
        var select=d.querySelector('select.goog-te-combo');
        tries++;
        if(select){
          clearInterval(timer);
          select.value=lang;
          select.dispatchEvent(new Event('change'));
        }else if(tries>80){clearInterval(timer);}
      },250);
    };
    var sc=d.createElement('script');
    sc.id='ndn-google-script';
    sc.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    sc.async=true;
    d.body.appendChild(sc);
  }

  function setLang(lang){
    close();
    try{localStorage.setItem('lang',lang);}catch(e){}
    updateButton(lang);
    if(lang==='en')return goEnglish();
    // Hindi works fully even when this site is opened as local HTML files.
    if(lang==='hi')return goStaticHindi();
    // Google Translate requires a web origin. When hosted, translate the current page.
    if(location.protocol==='http:'||location.protocol==='https:'){
      loadGoogle(lang);
      return;
    }
    // Local-file fallback: keep the selection and translate the main UI labels.
    applyLocalUi(lang);
  }

  list.addEventListener('click',function(e){var item=e.target.closest('li');if(item)setLang(item.getAttribute('data-l'));});
  list.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var item=e.target.closest('li');if(item){e.preventDefault();setLang(item.getAttribute('data-l'));}}});

  /* Lightweight offline UI fallback for local files. Full-page translation is provided by Google Translate on http/https. */
  var ui={
    hi:{Home:'होम','Madhya Pradesh':'मध्य प्रदेश',National:'राष्ट्रीय',Politics:'राजनीति',Categories:'श्रेणियाँ',Crime:'अपराध',ePaper:'ई-पेपर',Contact:'संपर्क','About Us':'हमारे बारे में',Disclaimer:'अस्वीकरण','Privacy Policy':'गोपनीयता नीति',Sitemap:'साइट मैप','Search news...':'समाचार खोजें...','Breaking News':'ब्रेकिंग न्यूज़','Latest News':'ताज़ा खबरें','Trending Now':'अभी चर्चा में','View All':'सभी देखें','Learn More':'और जानें','Quick Links':'त्वरित लिंक','Connect With Us':'हमसे जुड़ें',Search:'खोजें',Like:'लाइक',Subscribe:'सब्सक्राइब',Message:'मैसेज',Flash:'फ्लैश'},
    or:{Home:'ମୁଖ୍ୟ ପୃଷ୍ଠା',National:'ଜାତୀୟ',Politics:'ରାଜନୀତି',Categories:'ବିଭାଗ',Crime:'ଅପରାଧ',Contact:'ଯୋଗାଯୋଗ','About Us':'ଆମ ବିଷୟରେ',Disclaimer:'ଅସ୍ୱୀକାରୋକ୍ତି','Privacy Policy':'ଗୋପନୀୟତା ନୀତି',Sitemap:'ସାଇଟମ୍ୟାପ','Breaking News':'ବ୍ରେକିଂ ନ୍ୟୁଜ୍','Latest News':'ସର୍ବଶେଷ ଖବର','Trending Now':'ଟ୍ରେଣ୍ଡିଂ','View All':'ସମସ୍ତ ଦେଖନ୍ତୁ','Quick Links':'ତ୍ୱରିତ ଲିଙ୍କ','Connect With Us':'ଆମ ସହିତ ଯୋଗାଯୋଗ'},
    bn:{Home:'হোম',National:'জাতীয়',Politics:'রাজনীতি',Categories:'বিভাগ',Crime:'অপরাধ',Contact:'যোগাযোগ','About Us':'আমাদের সম্পর্কে',Disclaimer:'দাবিত্যাগ','Privacy Policy':'গোপনীয়তা নীতি',Sitemap:'সাইটম্যাপ','Breaking News':'ব্রেকিং নিউজ','Latest News':'সর্বশেষ খবর','Trending Now':'ট্রেন্ডিং','View All':'সব দেখুন','Quick Links':'দ্রুত লিঙ্ক','Connect With Us':'যোগাযোগ করুন'},
    gu:{Home:'હોમ',National:'રાષ્ટ્રીય',Politics:'રાજકારણ',Categories:'શ્રેણીઓ',Crime:'ગુનો',Contact:'સંપર્ક','About Us':'અમારા વિશે',Disclaimer:'અસ્વીકરણ','Privacy Policy':'ગોપનીયતા નીતિ',Sitemap:'સાઇટમેપ','Breaking News':'બ્રેકિંગ ન્યૂઝ','Latest News':'તાજા સમાચાર','Trending Now':'ટ્રેન્ડિંગ','View All':'બધું જુઓ','Quick Links':'ઝડપી લિંક્સ','Connect With Us':'અમારી સાથે જોડાઓ'},
    pa:{Home:'ਹੋਮ',National:'ਰਾਸ਼ਟਰੀ',Politics:'ਰਾਜਨੀਤੀ',Categories:'ਸ਼੍ਰੇਣੀਆਂ',Crime:'ਅਪਰਾਧ',Contact:'ਸੰਪਰਕ','About Us':'ਸਾਡੇ ਬਾਰੇ',Disclaimer:'ਬੇਦਾਅਵਾ','Privacy Policy':'ਪਰਾਈਵੇਸੀ ਨੀਤੀ',Sitemap:'ਸਾਈਟਮੈਪ','Breaking News':'ਤਾਜ਼ਾ ਖ਼ਬਰ','Latest News':'ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ','Trending Now':'ਟ੍ਰੈਂਡਿੰਗ','View All':'ਸਭ ਵੇਖੋ','Quick Links':'ਤੁਰੰਤ ਲਿੰਕ','Connect With Us':'ਸਾਡੇ ਨਾਲ ਜੁੜੋ'},
    ta:{Home:'முகப்பு',National:'தேசிய',Politics:'அரசியல்',Categories:'வகைகள்',Crime:'குற்றம்',Contact:'தொடர்பு','About Us':'எங்களைப் பற்றி',Disclaimer:'மறுப்பு','Privacy Policy':'தனியுரிமைக் கொள்கை',Sitemap:'தளவரைபடம்','Breaking News':'அவசரச் செய்திகள்','Latest News':'சமீபத்திய செய்திகள்','Trending Now':'பிரபலமானவை','View All':'அனைத்தையும் காண்க','Quick Links':'விரைவு இணைப்புகள்','Connect With Us':'எங்களுடன் இணையுங்கள்'},
    te:{Home:'హోమ్',National:'జాతీయ',Politics:'రాజకీయాలు',Categories:'వర్గాలు',Crime:'నేరం',Contact:'సంప్రదించండి','About Us':'మా గురించి',Disclaimer:'నిరాకరణ','Privacy Policy':'గోప్యతా విధానం',Sitemap:'సైట్‌మ్యాప్','Breaking News':'బ్రేకింగ్ న్యూస్','Latest News':'తాజా వార్తలు','Trending Now':'ట్రెండింగ్','View All':'అన్నీ చూడండి','Quick Links':'త్వరిత లింకులు','Connect With Us':'మాతో కలవండి'},
    mr:{Home:'मुख्यपृष्ठ',National:'राष्ट्रीय',Politics:'राजकारण',Categories:'श्रेणी',Crime:'गुन्हे',Contact:'संपर्क','About Us':'आमच्याबद्दल',Disclaimer:'अस्वीकरण','Privacy Policy':'गोपनीयता धोरण',Sitemap:'साइटमॅप','Breaking News':'ब्रेकिंग न्यूज','Latest News':'ताज्या बातम्या','Trending Now':'ट्रेंडिंग','View All':'सर्व पहा','Quick Links':'जलद दुवे','Connect With Us':'आमच्याशी जोडा'},
    kn:{Home:'ಮುಖಪುಟ',National:'ರಾಷ್ಟ್ರೀಯ',Politics:'ರಾಜಕೀಯ',Categories:'ವರ್ಗಗಳು',Crime:'ಅಪರಾಧ',Contact:'ಸಂಪರ್ಕಿಸಿ','About Us':'ನಮ್ಮ ಬಗ್ಗೆ',Disclaimer:'ಹಕ್ಕು ನಿರಾಕರಣೆ','Privacy Policy':'ಗೌಪ್ಯತಾ ನೀತಿ',Sitemap:'ಸೈಟ್‌ಮ್ಯಾಪ್','Breaking News':'ಬ್ರೇಕಿಂಗ್ ನ್ಯೂಸ್','Latest News':'ಇತ್ತೀಚಿನ ಸುದ್ದಿ','Trending Now':'ಟ್ರೆಂಡಿಂಗ್','View All':'ಎಲ್ಲವನ್ನೂ ನೋಡಿ','Quick Links':'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು','Connect With Us':'ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ'},
    ml:{Home:'ഹോം',National:'ദേശീയ',Politics:'രാഷ്ട്രീയം',Categories:'വിഭാഗങ്ങൾ',Crime:'കുറ്റകൃത്യം',Contact:'ബന്ധപ്പെടുക','About Us':'ഞങ്ങളെക്കുറിച്ച്',Disclaimer:'നിരാകരണം','Privacy Policy':'സ്വകാര്യതാ നയം',Sitemap:'സൈറ്റ്മാപ്പ്','Breaking News':'ബ്രേക്കിംഗ് ന്യൂസ്','Latest News':'പുതിയ വാർത്തകൾ','Trending Now':'ട്രെൻഡിംഗ്','View All':'എല്ലാം കാണുക','Quick Links':'ദ്രുത ലിങ്കുകൾ','Connect With Us':'ഞങ്ങളുമായി ബന്ധപ്പെടുക'}
  };
  function applyLocalUi(lang){
    var map=ui[lang];if(!map)return;
    var walker=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT,null,false),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(n){
      var raw=n.nodeValue,trim=raw.trim();if(!trim)return;
      if(map[trim])n.nodeValue=raw.replace(trim,map[trim]);
    });
    d.querySelectorAll('input[placeholder],input[aria-label]').forEach(function(el){
      var key=el.getAttribute('placeholder')||el.getAttribute('aria-label');
      if(map[key]){if(el.placeholder)el.placeholder=map[key];if(el.getAttribute('aria-label'))el.setAttribute('aria-label',map[key]);}
    });
    d.documentElement.lang=lang;
  }

  // If this is a local page and a non-English language was previously selected, apply the UI fallback.
  if((location.protocol==='file:'||location.protocol==='') && current!=='en' && !isHindiPath){applyLocalUi(current);}
  updateButton(isHindiPath?'hi':current);
  if((location.protocol==='http:'||location.protocol==='https:') && current!=='en' && !isHindiPath){loadGoogle(current);}
})();
