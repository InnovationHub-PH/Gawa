import{_ as H}from"./auth-DasK3Pgx.js";import{b as Ee}from"./blogData-BZ1nJePQ.js";const te=[{title:"Job Title",company:"Company Name",logo:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:"Makati, MNL",coordinates:{lat:14.5547,lng:120.9947},remote:!1,tags:["robotics","hardware"],description:"Describe the Job openning here..."},{title:"Software Developer",company:"Remote Robotics",logo:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:"Remote",coordinates:{lat:14.5995,lng:120.9842},remote:!0,tags:["software","robotics"],description:"Developing control systems for autonomous robots. We are looking for a skilled software developer with experience in robotics and control systems. The ideal candidate will have a strong background in Python, C++, and ROS. You will be working with a team of engineers to develop and implement control algorithms for our autonomous robot fleet. Key responsibilities include: developing and maintaining robot control software, implementing new features and functionality, debugging and troubleshooting issues, and collaborating with the hardware team."},{title:"Mechatronics Intern",company:"Innovation Labs",logo:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:"Boston, MA",coordinates:{lat:14.558,lng:120.989},remote:!1,tags:["internship","hardware","software"],description:"Summer internship opportunity in our robotics division. Join our team of experts and gain hands-on experience in robotics development."},{title:"Control Systems Engineer",company:"Virtual Mechanics",logo:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:"Remote",coordinates:{lat:14.5648,lng:120.9932},remote:!0,tags:["software","hardware"],description:"Design and implement control systems for industrial robots. Work with cutting-edge technology and collaborate with a global team."}];let x=new Set,j=!1,q="";const De=document.getElementById("jobsList"),Re=document.querySelectorAll(".tag-btn"),fe=document.getElementById("remoteToggle"),qe=document.getElementById("searchInput");function xe(e,a){const t=e.split(" ");return t.length<=a?e:t.slice(0,a).join(" ")+"..."}function Fe(e){const a=e.split(" ");return a.length>850?a.slice(0,850).join(" ")+"...":e}function Be(e){const a=xe(e.description,11),t=Fe(e.description),n=a===t;return`
        <div class="card">
            <div class="card-header">
                <img src="${e.logo}" alt="${e.company} logo" class="card-logo">
                <div class="title-info">
                    <h3>${e.title}</h3>
                    <h4>${e.company}</h4>
                    <p class="location">${e.location}</p>
                </div>
            </div>
            <div class="tags">
                ${e.tags.map(o=>`<span class="tag">${o.toUpperCase()}</span>`).join("")}
            </div>
            <div class="description-container">
                <p class="description truncated">${a}</p>
                <p class="description full" style="display: none;">${t}</p>
                ${n?"":'<button class="read-more">READ MORE</button>'}
            </div>
            <a href="#" class="sqr-btn">APPLY NOW</a>
        </div>
    `}function Y(){const e=te.filter(a=>!(a.title.toLowerCase().includes(q.toLowerCase())||a.company.toLowerCase().includes(q.toLowerCase())||a.description.toLowerCase().includes(q.toLowerCase())||a.tags.some(n=>n.toLowerCase().includes(q.toLowerCase())))||j&&!a.remote?!1:x.size===0?!0:a.tags.some(n=>x.has(n)));De.innerHTML=e.map(Be).join(""),document.querySelectorAll(".read-more").forEach(a=>{a.addEventListener("click",function(t){const n=this.closest(".description-container"),o=n.querySelector(".truncated"),i=n.querySelector(".full");o.style.display!=="none"?(o.style.display="none",i.style.display="block",this.textContent="READ LESS"):(o.style.display="block",i.style.display="none",this.textContent="READ MORE")})})}Re.forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.tag;x.has(a)?(x.delete(a),e.classList.remove("active")):(x.add(a),e.classList.add("active")),Y()})});fe.addEventListener("click",()=>{j=!j,fe.checked=j,Y()});qe.addEventListener("input",e=>{q=e.target.value,Y()});Y();const V=[{name:"TechLabs Manila",category:"COMPANIES",website:"https://techlabs.ph",email:"contact@techlabs.ph",phone:"+63 2 8123 4567",facebook:"https://facebook.com/techlabsmanila",tags:["company","robotics","software"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",pdfDocument:"https://innovationhub-ph.github.io/MakersClub/Portfolios/portfolio_Darja_Osojnik.pdf",location:{lat:14.5547,lng:120.9947,address:"Makati City, Philippines"}},{name:"RoboCore Solutions",category:"COMPANIES",website:"https://robocore.ph",email:"info@robocore.ph",phone:"+63 2 8234 5678",facebook:"https://facebook.com/robocore",tags:["company","robotics","hardware"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:{lat:14.558,lng:120.989,address:"BGC, Taguig City, Philippines"}},{name:"De La Salle University",category:"EDUCATIONAL INSTITUTIONS",website:"https://www.dlsu.edu.ph",email:"info@dlsu.edu.ph",phone:"+63 2 8524 4611",facebook:"https://facebook.com/dlsu",tags:["education","robotics","research"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:{lat:14.5648,lng:120.9932,address:"2401 Taft Avenue, Manila"}},{name:"Mapua University",category:"EDUCATIONAL INSTITUTIONS",website:"https://mapua.edu.ph",email:"info@mapua.edu.ph",phone:"+63 2 8247 5000",facebook:"https://facebook.com/mapua",tags:["education","robotics","engineering"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:{lat:14.5907,lng:120.9748,address:"Intramuros, Manila"}},{name:"Jon Prado",category:"INDIVIDUALS",website:"https://jonprado.com",email:"jon@example.com",phone:"+63 917 123 4567",facebook:"https://facebook.com/jonprado",tags:["individual","hardware","software"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:{lat:14.5695,lng:120.9822,address:"Manila, Philippines"}},{name:"Maria Santos",category:"INDIVIDUALS",website:"https://mariasantos.dev",email:"maria@example.com",phone:"+63 918 234 5678",facebook:"https://facebook.com/mariasantos",tags:["individual","robotics","software"],profileImage:"https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png",location:{lat:14.5542,lng:120.9965,address:"Makati City, Philippines"}}];let _=null,me=!1;async function Se(){if(!_)try{if(_=await H(()=>import("./pdfjs-BnPRJEQ6.js"),[],import.meta.url),!me){const e=await H(()=>import("./pdf.worker-BAay3TpF.js"),[],import.meta.url);_.GlobalWorkerOptions.workerSrc=e.default,me=!0}}catch(e){console.warn("PDF.js not available:",e)}return _}function K(e,a){const t=e.split(" ");return t.length<=a?e:t.slice(0,a).join(" ")+"..."}let R=null,Ce=new Map,D=null,S=null,T=1,F=new Set;function Oe(){if(!document.getElementById("communityMap"))return;if(typeof L>"u"){console.error("Leaflet library not loaded");return}R=L.map("communityMap").setView([14.5995,120.9842],12),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(R),V.forEach(n=>{if(n.location){const o=L.marker([n.location.lat,n.location.lng]).bindPopup(`
          <strong>${n.name}</strong><br>
          ${n.location.address}
        `).addTo(R);Ce.set(n.name,o),o.on("click",()=>{ke(n.name)})}}),D=document.createElement("div"),D.className="pdf-modal",D.innerHTML=`
    <div class="pdf-modal-content">
      <button class="close-modal">&times;</button>
      <button class="nav-btn prev-page">←</button>
      <canvas id="pdf-canvas"></canvas>
      <button class="nav-btn next-page">→</button>
      <div class="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></div>
    </div>
  `,document.body.appendChild(D),document.querySelector(".close-modal").addEventListener("click",()=>{D.style.display="none",S=null,T=1}),document.querySelector(".prev-page").addEventListener("click",()=>{T>1&&(T--,ae(S.url,T))}),document.querySelector(".next-page").addEventListener("click",()=>{T<S.numPages&&(T++,ae(S.url,T))});const a=document.getElementById("searchInput"),t=document.querySelectorAll(".tag-btn");a&&a.addEventListener("input",Z),t.forEach(n=>{n.addEventListener("click",()=>{const o=n.dataset.tag;F.has(o)?(F.delete(o),n.classList.remove("active")):(F.add(o),n.classList.add("active")),Z()})}),document.querySelectorAll(".directory-category h2").forEach(n=>{n.addEventListener("click",()=>{n.closest(".directory-category").classList.toggle("collapsed")})}),Z()}async function ae(e,a=1){try{const t=await Se();if(!t){console.error("PDF.js not available");return}S||(S=await t.getDocument(e).promise);const n=await S.getPage(a),o=document.getElementById("pdf-canvas"),i=o.getContext("2d"),s=n.getViewport({scale:1.5});o.height=s.height,o.width=s.width,await n.render({canvasContext:i,viewport:s}).promise,document.getElementById("current-page").textContent=a,document.getElementById("total-pages").textContent=S.numPages,D.style.display="flex"}catch(t){console.error("Error loading PDF:",t)}}function Ne(e){const a={};if(e.website){const n=e.website.replace("https://","").replace("http://","");a.website={full:e.website,truncated:K(n,11),needsReadMore:n.split(" ").length>11}}if(e.email&&(a.email={full:e.email,truncated:K(e.email,11),needsReadMore:e.email.split(" ").length>11}),e.facebook){const n=e.facebook.replace("https://facebook.com/","@");a.facebook={full:e.facebook,truncated:K(n,11),needsReadMore:n.split(" ").length>11}}const t=e.pdfDocument?`
    <div class="pdf-preview" data-pdf-url="${e.pdfDocument}">
      <canvas class="pdf-thumbnail"></canvas>
      <button class="view-pdf-btn">View Document</button>
    </div>
  `:"";return`
    <div class="card member-card" data-member="${e.name}" data-tags="${e.tags.join(" ")}">
      <div class="card-header">
        <img src="${e.profileImage}" alt="${e.name}" class="card-logo">
        <div class="title-info">
          <h3>${e.name}</h3>
          ${e.location?`<p class="member-location">${e.location.address}</p>`:""}
        </div>
      </div>
      <div class="member-info">
        ${e.website?`
          <div class="info-item">
            <span class="info-label">Website: </span>
            <span class="info-content">
              <span class="truncated"><a href="${a.website.full}" target="_blank">${a.website.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${a.website.full}" target="_blank">${a.website.full}</a></span>
              ${a.website.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
        ${e.email?`
          <div class="info-item">
            <span class="info-label">Email: </span>
            <span class="info-content">
              <span class="truncated"><a href="mailto:${a.email.full}">${a.email.truncated}</a></span>
              <span class="full" style="display: none;"><a href="mailto:${a.email.full}">${a.email.full}</a></span>
              ${a.email.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
        ${e.phone?`<p>Phone: <a href="tel:${e.phone}">${e.phone}</a></p>`:""}
        ${e.facebook?`
          <div class="info-item">
            <span class="info-label">Facebook: </span>
            <span class="info-content">
              <span class="truncated"><a href="${a.facebook.full}" target="_blank">${a.facebook.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${a.facebook.full}" target="_blank">${a.facebook.full}</a></span>
              ${a.facebook.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
      </div>
      ${t}
      <div class="tags">
        ${e.tags.map(n=>`<span class="tag">${n.toUpperCase()}</span>`).join("")}
      </div>
    </div>
  `}function _e(){document.querySelectorAll(".pdf-preview").forEach(async e=>{const a=e.dataset.pdfUrl,t=e.querySelector(".pdf-thumbnail"),n=e.querySelector(".view-pdf-btn");try{const o=await Se();if(!o){console.warn("PDF.js not available for preview");return}const l=await(await o.getDocument(a).promise).getPage(1),r=l.getViewport({scale:.5});t.height=r.height,t.width=r.width,await l.render({canvasContext:t.getContext("2d"),viewport:r}).promise,n.addEventListener("click",()=>ae(a))}catch(o){console.error("Error loading PDF preview:",o)}})}function Z(){const e=document.getElementById("searchInput"),a=e?e.value.toLowerCase():"";document.querySelectorAll(".member-grid").forEach(t=>{t.innerHTML=""}),V.forEach(t=>{const n=t.name.toLowerCase().includes(a)||t.tags.some(i=>i.toLowerCase().includes(a)),o=F.size===0||t.tags.some(i=>F.has(i));if(n&&o){const i=Array.from(document.querySelectorAll(".directory-category")).find(s=>s.querySelector("h2").textContent===t.category);i&&i.querySelector(".member-grid").insertAdjacentHTML("beforeend",Ne(t))}}),document.querySelectorAll(".member-card").forEach(t=>{t.addEventListener("click",n=>{if(n.target.tagName==="BUTTON"||n.target.tagName==="A"||n.target.closest("button")||n.target.closest("a"))return;const o=t.dataset.member;ke(o)})}),document.querySelectorAll(".read-more-info").forEach(t=>{t.addEventListener("click",function(n){n.stopPropagation();const o=this.closest(".info-content"),i=o.querySelector(".truncated"),s=o.querySelector(".full");i.style.display!=="none"?(i.style.display="none",s.style.display="inline",this.textContent="READ LESS"):(i.style.display="inline",s.style.display="none",this.textContent="READ MORE")})}),_e()}function ke(e){document.querySelectorAll(".member-card.highlighted").forEach(n=>{n.classList.remove("highlighted")});const a=document.querySelector(`.member-card[data-member="${e}"]`);a&&(a.classList.add("highlighted"),a.scrollIntoView({behavior:"smooth",block:"nearest"}));const t=Ce.get(e);t&&(t.openPopup(),R&&R.setView(t.getLatLng(),R.getZoom()))}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("communityMap")&&Oe()});const he=[{id:1,name:"3D Printer - Prusa i3 MK3S+",type:"machine",category:"3d-printer",owner:"TechLabs Manila",location:{lat:14.5547,lng:120.9947,address:"Makati City, Philippines"},availability:"available",hourlyRate:150,description:"High-quality FDM 3D printer capable of printing PLA, PETG, and ABS materials. Build volume: 250×210×210mm.",contact:"contact@techlabs.ph",image:"https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg",tags:["3d-printing","prototyping","fdm"]},{id:2,name:"Laser Cutter - Epilog Zing 24",type:"machine",category:"laser-cutter",owner:"Innovation Labs",location:{lat:14.558,lng:120.989,address:"BGC, Taguig City, Philippines"},availability:"available",hourlyRate:300,description:"CO2 laser cutter for wood, acrylic, paper, and fabric. Cutting area: 610×305mm, 30W laser.",contact:"info@innovationlabs.ph",image:"https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg",tags:["laser-cutting","engraving","prototyping"]},{id:3,name:"CNC Mill - Haas Mini Mill",type:"machine",category:"cnc-mill",owner:"Precision Works",location:{lat:14.5648,lng:120.9932,address:"Manila, Philippines"},availability:"busy",hourlyRate:500,description:"Precision CNC milling machine for aluminum, steel, and plastic parts. 3-axis machining.",contact:"orders@precisionworks.ph",image:"https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg",tags:["cnc","machining","metal-working"]},{id:4,name:"PLA Filament - Various Colors",type:"material",category:"filament",owner:"Maker Supply Co.",location:{lat:14.5695,lng:120.9822,address:"Quezon City, Philippines"},availability:"available",price:25,unit:"per kg",description:"High-quality PLA filament in multiple colors. Diameter: 1.75mm. Perfect for 3D printing.",contact:"sales@makersupply.ph",image:"https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg",tags:["3d-printing","filament","pla"]},{id:5,name:"Acrylic Sheets - Clear & Colored",type:"material",category:"acrylic",owner:"Plastic Solutions",location:{lat:14.5542,lng:120.9965,address:"Pasig City, Philippines"},availability:"available",price:120,unit:"per sheet",description:"High-grade acrylic sheets, 3mm thickness. Available in clear and various colors. Perfect for laser cutting.",contact:"info@plasticsolutions.ph",image:"https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg",tags:["laser-cutting","acrylic","sheets"]},{id:6,name:"Arduino Starter Kit",type:"material",category:"electronics",owner:"Electronics Hub",location:{lat:14.5907,lng:120.9748,address:"Manila, Philippines"},availability:"available",price:1500,unit:"per kit",description:"Complete Arduino starter kit with Uno R3, breadboard, sensors, LEDs, resistors, and jumper wires.",contact:"support@electronicshub.ph",image:"https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg",tags:["electronics","arduino","prototyping"]}];let U=null,ye=!1;async function $e(){if(!U)try{if(U=await H(()=>import("./pdfjs-BnPRJEQ6.js"),[],import.meta.url),!ye){const e=await H(()=>import("./pdf.worker-BAay3TpF.js"),[],import.meta.url);U.GlobalWorkerOptions.workerSrc=e.default,ye=!0}}catch(e){console.warn("PDF.js not available:",e)}return U}let b="blog",k=new Set,w=new Set,E=new Set,z=!1,u="",f=0,d=null,J=new Map,oe=0;const ne=2;let be=!1,B=null,ve=null,y=null,ie=new Set,G=new Set,se=new Set,le=new Set,Q=0,X=!1;function O(e,a){const t=e.split(" ");return t.length<=a?e:t.slice(0,a).join(" ")+"..."}function Ue(){if(!d){if(typeof L>"u"){console.error("Leaflet library not loaded");return}d=L.map("searchMap").setView([14.5995,120.9842],12),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(d),typeof L.Draw<"u"?(B=new L.FeatureGroup,d.addLayer(B),ve=new L.Control.Draw({edit:{featureGroup:B},draw:{polygon:!0,rectangle:!0,circle:!1,marker:!1,polyline:!1,circlemarker:!1}}),d.addControl(ve),d.on(L.Draw.Event.CREATED,je),d.on(L.Draw.Event.DELETED,ze),d.on(L.Draw.Event.EDITED,We)):console.warn("Leaflet Draw not available - drawing features disabled")}}function je(e){const a=e.layer;B.clearLayers(),B.addLayer(a),y=a,h()}function ze(e){y=null,h()}function We(e){h()}function re(e,a){if(!y)return!0;const t=L.latLng(e,a);if(y instanceof L.Rectangle)return y.getBounds().contains(t);if(y instanceof L.Polygon){const n=y.getLatLngs()[0];return He(t,n)}return!0}function He(e,a){const t=e.lat,n=e.lng;let o=!1;for(let i=0,s=a.length-1;i<a.length;s=i++){const l=a[i].lat,r=a[i].lng,m=a[s].lat,g=a[s].lng;r>n!=g>n&&t<(m-l)*(n-r)/(g-r)+l&&(o=!o)}return o}function Ve(){J.forEach(e=>d.removeLayer(e)),J.clear()}function ce(e,a){Ve(),e.forEach(t=>{let n,o,i;if(a==="jobs"&&t.coordinates)n=[t.coordinates.lat,t.coordinates.lng],o=`<strong>${t.title}</strong><br>${t.company}<br>${t.location}`,i=`${t.title}-${t.company}`;else if(a==="community"&&t.location)n=[t.location.lat,t.location.lng],o=`<strong>${t.name}</strong><br>${t.location.address}`,i=t.name;else if(a==="fabrication"&&t.location){n=[t.location.lat,t.location.lng];const s=t.availability==="available"?"✅":"🔴";o=`<strong>${t.name}</strong><br>${t.owner}<br>${t.location.address}<br>${s} ${t.availability.toUpperCase()}`,i=t.name}if(n){const s=L.marker(n).bindPopup(o).addTo(d);s.on("click",()=>{Ze(i,a)}),J.set(i,s)}})}function Ie(){const e=new Set;return Ee.forEach(a=>{a.tags.forEach(t=>e.add(t))}),Array.from(e)}function Je(e){const a=e.availability==="available",t=e.type==="machine"?`₱${e.hourlyRate}/hour`:`₱${e.price} ${e.unit}`;return`
    <div class="card fabrication-card" data-item="${e.name}" data-tags="${e.tags.join(" ")}" data-type="${e.type}" data-category="${e.category}">
      <div class="card-header">
        <img src="${e.image}" alt="${e.name}" class="card-logo">
        <div class="title-info">
          <h3>${e.name}</h3>
          <h4>${e.owner}</h4>
          <p class="location">${e.location.address}</p>
        </div>
      </div>
      <div class="fabrication-info">
        <div class="availability-status ${a?"available":"busy"}">
          ${a?"AVAILABLE":"BUSY"}
        </div>
        <div class="price-info">${t}</div>
        <p class="description">${e.description}</p>
        <p class="contact-info">Contact: <a href="mailto:${e.contact}">${e.contact}</a></p>
      </div>
      <div class="tags">
        ${e.tags.map(n=>`<span class="tag">${n.toUpperCase()}</span>`).join("")}
      </div>
    </div>
  `}function Ge(e){const a=e.excerpt||e.content.split(`
`)[0],t=O(a,11),n=a.split(" ").length>11;return`
    <a href="post.html?id=${e.id}" class="card blog-card" data-tags="${e.tags.join(" ")}">
      <div class="blog-image">
        <img src="${e.image}" alt="${e.title}">
      </div>
      <div class="blog-content">
        <h3>${e.title}</h3>
        <div class="blog-meta">
          <span class="blog-date">${new Date(e.date).toLocaleDateString()}</span>
          <span class="blog-author">By ${e.author}</span>
        </div>
        <div class="blog-excerpt">
          <p class="truncated">${t}</p>
          <p class="full" style="display: none;">${a}</p>
          ${n?'<button class="read-more-blog">READ MORE</button>':""}
        </div>
        <div class="tags">
          ${e.tags.map(o=>`<span class="tag">${o.toUpperCase()}</span>`).join("")}
        </div>
      </div>
    </a>
  `}function Ye(e){const a=O(e.description,11),t=e.description,n=a===t;return`
    <div class="card">
      <div class="card-header">
        <img src="${e.logo}" alt="${e.company} logo" class="card-logo">
        <div class="title-info">
          <h3>${e.title}</h3>
          <h4>${e.company}</h4>
          <p class="location">${e.location}</p>
        </div>
      </div>
      <div class="tags">
        ${e.tags.map(o=>`<span class="tag">${o.toUpperCase()}</span>`).join("")}
      </div>
      <div class="description-container">
        <p class="description truncated">${a}</p>
        <p class="description full" style="display: none;">${t}</p>
        ${n?"":'<button class="read-more">READ MORE</button>'}
      </div>
      <a href="#" class="sqr-btn">APPLY NOW</a>
    </div>
  `}function Ke(e){const a={};if(e.website){const n=e.website.replace("https://","").replace("http://","");a.website={full:e.website,truncated:O(n,11),needsReadMore:n.split(" ").length>11}}if(e.email&&(a.email={full:e.email,truncated:O(e.email,11),needsReadMore:e.email.split(" ").length>11}),e.facebook){const n=e.facebook.replace("https://facebook.com/","@");a.facebook={full:e.facebook,truncated:O(n,11),needsReadMore:n.split(" ").length>11}}const t=e.pdfDocument?`
    <div class="pdf-preview" data-pdf-url="${e.pdfDocument}">
      <canvas class="pdf-thumbnail"></canvas>
      <button class="view-pdf-btn">View Document</button>
    </div>
  `:"";return`
    <div class="card member-card" data-member="${e.name}" data-tags="${e.tags.join(" ")}">
      <div class="card-header">
        <img src="${e.profileImage}" alt="${e.name}" class="card-logo">
        <div class="title-info">
          <h3>${e.name}</h3>
          ${e.location?`<p class="member-location">${e.location.address}</p>`:""}
        </div>
      </div>
      <div class="member-info">
        ${e.website?`
          <div class="info-item">
            <span class="info-label">Website: </span>
            <span class="info-content">
              <span class="truncated"><a href="${a.website.full}" target="_blank">${a.website.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${a.website.full}" target="_blank">${a.website.full}</a></span>
              ${a.website.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
        ${e.email?`
          <div class="info-item">
            <span class="info-label">Email: </span>
            <span class="info-content">
              <span class="truncated"><a href="mailto:${a.email.full}">${a.email.truncated}</a></span>
              <span class="full" style="display: none;"><a href="mailto:${a.email.full}">${a.email.full}</a></span>
              ${a.email.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
        ${e.phone?`<p>Phone: <a href="tel:${e.phone}">${e.phone}</a></p>`:""}
        ${e.facebook?`
          <div class="info-item">
            <span class="info-label">Facebook: </span>
            <span class="info-content">
              <span class="truncated"><a href="${a.facebook.full}" target="_blank">${a.facebook.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${a.facebook.full}" target="_blank">${a.facebook.full}</a></span>
              ${a.facebook.needsReadMore?'<button class="read-more-info">READ MORE</button>':""}
            </span>
          </div>
        `:""}
      </div>
      ${t}
      <div class="tags">
        ${e.tags.map(n=>`<span class="tag">${n.toUpperCase()}</span>`).join("")}
      </div>
    </div>
  `}function Ze(e,a){if(document.querySelectorAll(".card.highlighted").forEach(t=>{t.classList.remove("highlighted")}),a==="jobs")document.querySelectorAll("#jobsList .card").forEach(n=>{const o=n.querySelector("h3").textContent,i=n.querySelector("h4").textContent;`${o}-${i}`===e&&(n.classList.add("highlighted"),n.scrollIntoView({behavior:"smooth",block:"center"}))});else if(a==="community"){const t=document.querySelector(`.member-card[data-member="${e}"]`);t&&(t.classList.add("highlighted"),t.scrollIntoView({behavior:"smooth",block:"center"}))}}function de(e){const a=J.get(e);a&&(a.openPopup(),d.setView(a.getLatLng(),d.getZoom()))}function W(){const e=Ee.filter(l=>{const r=l.title.toLowerCase().includes(u.toLowerCase())||l.content.toLowerCase().includes(u.toLowerCase())||l.author.toLowerCase().includes(u.toLowerCase())||l.tags.some(g=>g.toLowerCase().includes(u.toLowerCase())),m=(window.innerWidth<=768&&b==="blog"?G:k).size===0||l.tags.some(g=>(window.innerWidth<=768&&b==="blog"?G:k).has(g));return r&&m}),a=window.innerWidth<=768?1:3,t=Math.ceil(e.length/a);f>=t&&(f=Math.max(0,t-1));const n=f*a,o=e.slice(n,n+a),i=document.querySelector(".prev-btn"),s=document.querySelector(".next-btn");i.disabled=f===0,s.disabled=f>=t-1,document.getElementById("blogGrid").innerHTML=o.map(Ge).join(""),document.querySelectorAll(".read-more-blog").forEach(l=>{l.addEventListener("click",function(r){r.preventDefault(),r.stopPropagation();const m=this.closest(".blog-excerpt"),g=m.querySelector(".truncated"),$=m.querySelector(".full");g.style.display!=="none"?(g.style.display="none",$.style.display="block",this.textContent="READ LESS"):(g.style.display="block",$.style.display="none",this.textContent="READ MORE")})}),Prism.highlightAll()}function Qe(){let e=te;y&&(e=te.filter(t=>t.coordinates?re(t.coordinates.lat,t.coordinates.lng):!1));const a=e.filter(t=>{if(!(t.title.toLowerCase().includes(u.toLowerCase())||t.company.toLowerCase().includes(u.toLowerCase())||t.description.toLowerCase().includes(u.toLowerCase())||t.tags.some(i=>i.toLowerCase().includes(u.toLowerCase())))||z&&!t.remote)return!1;const o=window.innerWidth<=768&&b==="jobs"?se:k;return o.size===0?!0:t.tags.some(i=>o.has(i))});document.getElementById("jobsList").innerHTML=a.map(Ye).join(""),document.querySelectorAll(".read-more").forEach(t=>{t.addEventListener("click",function(n){const o=this.closest(".description-container"),i=o.querySelector(".truncated"),s=o.querySelector(".full");i.style.display!=="none"?(i.style.display="none",s.style.display="block",this.textContent="READ LESS"):(i.style.display="block",s.style.display="none",this.textContent="READ MORE")})}),document.querySelectorAll("#jobsList .card").forEach(t=>{t.addEventListener("click",n=>{if(n.target.tagName==="BUTTON"||n.target.tagName==="A")return;const o=t.querySelector("h3").textContent,i=t.querySelector("h4").textContent,s=`${o}-${i}`;document.querySelectorAll(".card.highlighted").forEach(l=>l.classList.remove("highlighted")),t.classList.add("highlighted"),de(s)})}),ce(a,"jobs")}function Xe(){const e=document.getElementById("communityFilterTrigger"),a=document.getElementById("blogFilterTrigger"),t=document.getElementById("jobsFilterTrigger"),n=document.getElementById("fabricationFilterTrigger"),o=document.getElementById("mobileFilterPopup"),i=document.getElementById("mobileFilterClose"),s=document.getElementById("mobileFilterOptions"),l=document.getElementById("mobileFilterTitle");let r="";e.addEventListener("click",()=>{r="community",l.textContent="SELECT COMMUNITY FILTERS",m()}),a.addEventListener("click",()=>{r="blog",l.textContent="SELECT BLOG FILTERS",m()}),t.addEventListener("click",()=>{r="jobs",l.textContent="SELECT JOB FILTERS",m()}),n.addEventListener("click",()=>{r="fabrication",l.textContent="SELECT FABRICATION FILTERS",m()});function m(){o.classList.add("active"),Me(r)}function g(c){switch(c){case"community":return[{tag:"company",label:"COMPANIES"},{tag:"individual",label:"INDIVIDUALS"},{tag:"education",label:"EDUCATION"},{tag:"robotics",label:"ROBOTICS"},{tag:"software",label:"SOFTWARE"},{tag:"hardware",label:"HARDWARE"}];case"blog":return Ie().map(p=>({tag:p,label:p.toUpperCase()}));case"jobs":return[{tag:"robotics",label:"ROBOTICS"},{tag:"software",label:"SOFTWARE"},{tag:"hardware",label:"HARDWARE"},{tag:"internship",label:"INTERNSHIP"},{tag:"industrial-design",label:"INDUSTRIAL DESIGN"},{tag:"manufacturing",label:"MANUFACTURING"},{tag:"mechatronics",label:"MECHATRONICS"}];case"fabrication":return[{tag:"3d-printer",label:"3D PRINTERS"},{tag:"laser-cutter",label:"LASER CUTTERS"},{tag:"cnc-mill",label:"CNC MILLS"},{tag:"cnc-router",label:"CNC ROUTERS"},{tag:"filament",label:"FILAMENTS"},{tag:"acrylic",label:"ACRYLIC"},{tag:"wood",label:"WOOD"},{tag:"electronics",label:"ELECTRONICS"}];default:return[]}}function $(c){switch(c){case"community":return ie;case"blog":return G;case"jobs":return se;case"fabrication":return le;default:return new Set}}function Te(c){switch(c){case"community":return document.getElementById("selectedFilters");case"blog":return document.getElementById("selectedBlogFilters");case"jobs":return document.getElementById("selectedJobsFilters");case"fabrication":return document.getElementById("selectedFabricationFilters");default:return null}}function Me(c){const p=g(c),I=$(c);s.innerHTML=p.map(v=>`
      <button class="mobile-filter-option ${I.has(v.tag)?"selected":""}" data-tag="${v.tag}">
        ${v.label}
      </button>
    `).join("")}function A(c){const p=Te(c),I=$(c);p&&(p.innerHTML="",I.forEach(v=>{const P=document.createElement("div");P.className="selected-filter-tag",P.innerHTML=`
        ${v.toUpperCase()}
        <button class="remove-filter" data-tag="${v}" data-mode="${c}">×</button>
      `,p.appendChild(P)}),p.querySelectorAll(".remove-filter").forEach(v=>{v.addEventListener("click",P=>{const Pe=P.target.dataset.tag,ge=P.target.dataset.mode;$(ge).delete(Pe),A(ge),h()})}))}function Ae(){A("community"),A("blog"),A("jobs"),A("fabrication")}s.addEventListener("click",c=>{if(c.target.classList.contains("mobile-filter-option")){const p=c.target.dataset.tag,I=$(r);I.has(p)?(I.delete(p),c.target.classList.remove("selected")):(I.add(p),c.target.classList.add("selected")),A(r),h()}}),i.addEventListener("click",()=>{o.classList.remove("active")}),o.addEventListener("click",c=>{c.target===o&&o.classList.remove("active")}),Ae()}function et(){let e=V;y&&(e=V.filter(t=>t.location?re(t.location.lat,t.location.lng):!1));const a=e.filter(t=>{const n=t.name.toLowerCase().includes(u.toLowerCase())||t.tags.some(s=>s.toLowerCase().includes(u.toLowerCase())),o=window.innerWidth<=768&&b==="community"?ie:k,i=o.size===0||t.tags.some(s=>o.has(s));return n&&i});document.querySelector(".companies-grid").innerHTML="",document.querySelector(".individuals-grid").innerHTML="",document.querySelector(".education-grid").innerHTML="",a.forEach(t=>{let n;t.category==="COMPANIES"?n=document.querySelector(".companies-grid"):t.category==="INDIVIDUALS"?n=document.querySelector(".individuals-grid"):t.category==="EDUCATIONAL INSTITUTIONS"&&(n=document.querySelector(".education-grid")),n&&n.insertAdjacentHTML("beforeend",Ke(t))}),document.querySelectorAll(".read-more-info").forEach(t=>{t.addEventListener("click",function(n){n.stopPropagation();const o=this.closest(".info-content"),i=o.querySelector(".truncated"),s=o.querySelector(".full");i.style.display!=="none"?(i.style.display="none",s.style.display="inline",this.textContent="READ LESS"):(i.style.display="inline",s.style.display="none",this.textContent="READ MORE")})}),ot(),document.querySelectorAll(".member-card").forEach(t=>{t.addEventListener("click",n=>{if(n.target.tagName==="BUTTON"||n.target.tagName==="A"||n.target.closest("button")||n.target.closest("a"))return;const o=t.dataset.member;document.querySelectorAll(".card.highlighted").forEach(i=>i.classList.remove("highlighted")),t.classList.add("highlighted"),de(o)})}),ce(a,"community")}function tt(){let e=he;y&&(e=he.filter(t=>t.location?re(t.location.lat,t.location.lng):!1));const a=e.filter(t=>{if(!(t.name.toLowerCase().includes(u.toLowerCase())||t.owner.toLowerCase().includes(u.toLowerCase())||t.description.toLowerCase().includes(u.toLowerCase())||t.tags.some(i=>i.toLowerCase().includes(u.toLowerCase()))))return!1;const o=window.innerWidth<=768&&b==="fabrication"?le:new Set([...w,...E]);if(window.innerWidth<=768&&b==="fabrication"){if(o.size>0){const i=o.has(t.category),s=t.tags.some(l=>o.has(l));if(!i&&!s)return!1}}else if(w.size>0&&t.type==="machine"&&!w.has(t.category)||E.size>0&&t.type==="material"&&!E.has(t.category)||(w.size>0||E.size>0)&&(t.type==="machine"&&w.size===0||t.type==="material"&&E.size===0))return!1;return!0});document.querySelector(".machines-grid").innerHTML="",document.querySelector(".materials-grid").innerHTML="",a.forEach(t=>{let n;t.type==="machine"?n=document.querySelector(".machines-grid"):t.type==="material"&&(n=document.querySelector(".materials-grid")),n&&n.insertAdjacentHTML("beforeend",Je(t))}),document.querySelectorAll(".fabrication-card").forEach(t=>{t.addEventListener("click",n=>{if(n.target.tagName==="BUTTON"||n.target.tagName==="A"||n.target.closest("button")||n.target.closest("a"))return;const o=t.dataset.item;document.querySelectorAll(".card.highlighted").forEach(i=>i.classList.remove("highlighted")),t.classList.add("highlighted"),de(o)})}),ce(a,"fabrication")}function at(){be||(document.getElementById("aboutPopup").classList.remove("hidden"),be=!0)}function ee(){document.getElementById("aboutPopup").classList.add("hidden")}function nt(){const e=document.getElementById("closePopup"),a=document.getElementById("aboutPopup");e.addEventListener("click",ee),a.addEventListener("click",o=>{o.target===a&&ee()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&!a.classList.contains("hidden")&&ee()});const t=a.querySelectorAll(".indicator"),n=a.querySelectorAll(".carousel-slide");t.forEach((o,i)=>{o.addEventListener("click",()=>{n.forEach(s=>s.classList.remove("active")),t.forEach(s=>s.classList.remove("active")),n[i].classList.add("active"),o.classList.add("active")})}),setInterval(()=>{if(!a.classList.contains("hidden")){const i=(Array.from(n).findIndex(s=>s.classList.contains("active"))+1)%n.length;n.forEach(s=>s.classList.remove("active")),t.forEach(s=>s.classList.remove("active")),n[i].classList.add("active"),t[i].classList.add("active")}},8e3),setTimeout(at,500)}const N=document.createElement("div");N.className="pdf-modal";N.innerHTML=`
  <div class="pdf-modal-content">
    <button class="close-modal">&times;</button>
    <button class="nav-btn prev-page">←</button>
    <canvas id="pdf-canvas"></canvas>
    <button class="nav-btn next-page">→</button>
    <div class="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></div>
  </div>
`;document.body.appendChild(N);let C=null,M=1;async function ue(e,a=1){try{const t=await $e();if(!t){console.error("PDF.js not available");return}C||(C=await t.getDocument(e).promise);const n=await C.getPage(a),o=document.getElementById("pdf-canvas"),i=o.getContext("2d"),s=n.getViewport({scale:1.5});o.height=s.height,o.width=s.width,await n.render({canvasContext:i,viewport:s}).promise,document.getElementById("current-page").textContent=a,document.getElementById("total-pages").textContent=C.numPages,N.style.display="flex"}catch(t){console.error("Error loading PDF:",t)}}document.querySelector(".close-modal").addEventListener("click",()=>{N.style.display="none",C=null,M=1});document.querySelector(".prev-page").addEventListener("click",()=>{M>1&&(M--,ue(C.url,M))});document.querySelector(".next-page").addEventListener("click",()=>{M<C.numPages&&(M++,ue(C.url,M))});function ot(){document.querySelectorAll(".pdf-preview").forEach(async e=>{const a=e.dataset.pdfUrl,t=e.querySelector(".pdf-thumbnail"),n=e.querySelector(".view-pdf-btn");try{const o=await $e();if(!o){console.warn("PDF.js not available for preview");return}const l=await(await o.getDocument(a).promise).getPage(1),r=l.getViewport({scale:.5});t.height=r.height,t.width=r.width,await l.render({canvasContext:t.getContext("2d"),viewport:r}).promise,n.addEventListener("click",()=>ue(a))}catch(o){console.error("Error loading PDF preview:",o)}})}function Le(e){b=e,k.clear(),ie.clear(),G.clear(),se.clear(),le.clear(),w.clear(),E.clear(),f=0,document.querySelectorAll(".mode-btn").forEach(o=>{o.classList.toggle("active",o.dataset.mode===e)}),document.querySelectorAll(".filter-content").forEach(o=>{o.classList.toggle("active",o.id===`${e}Filters`)}),document.querySelectorAll(".results-content").forEach(o=>{o.classList.toggle("active",o.id===`${e}Results`)});const a=document.getElementById("mapContainer"),t=document.getElementById("mapColumn");e==="blog"?(a.style.display="none",t.style.display="none"):(a.style.display="block",t.style.display="block",d||Ue(),setTimeout(()=>d.invalidateSize(),100)),document.querySelectorAll(".tag-btn").forEach(o=>{o.classList.remove("active")}),["selectedFilters","selectedBlogFilters","selectedJobsFilters","selectedFabricationFilters"].forEach(o=>{const i=document.getElementById(o);i&&(i.innerHTML="")}),document.querySelectorAll(".tag-btn").forEach(o=>{o.classList.remove("active")}),h()}function pe(e){const a=document.querySelectorAll(".carousel-slide"),t=document.querySelectorAll(".indicator");a.forEach(n=>n.classList.remove("active")),t.forEach(n=>n.classList.remove("active")),a[e].classList.add("active"),t[e].classList.add("active"),oe=e}function we(){const e=(oe+1)%ne;pe(e)}function it(){const e=(oe-1+ne)%ne;pe(e)}function st(){document.querySelector(".prev-carousel").addEventListener("click",it),document.querySelector(".next-carousel").addEventListener("click",we),document.querySelectorAll(".indicator").forEach((e,a)=>{e.addEventListener("click",()=>pe(a))}),setInterval(we,8e3)}function h(){switch(b){case"blog":W();break;case"jobs":Qe();break;case"community":et();break;case"fabrication":tt();break}}function lt(){const e=window.scrollY,a=document.getElementById("searchInterface");e>Q&&e>100?a.classList.add("hidden"):e<Q&&a.classList.remove("hidden"),Q=e}function rt(){let e=!1;return function(){e||(requestAnimationFrame(()=>{lt(),e=!1}),e=!0)}}function ct(){ut(),nt(),Xe(),st();const e=document.getElementById("blogTags");Ie().forEach(s=>{const l=document.createElement("button");l.className="tag-btn",l.textContent=s.toUpperCase(),l.dataset.tag=s,e.appendChild(l)});const a=document.getElementById("searchInput"),t=document.getElementById("remoteToggle"),n=document.getElementById("machineSelect"),o=document.getElementById("materialSelect");document.querySelectorAll(".mode-btn").forEach(s=>{s.addEventListener("click",()=>{Le(s.dataset.mode)})}),a.addEventListener("input",s=>{u=s.target.value,f=0,h()}),document.addEventListener("click",s=>{if(s.target.classList.contains("tag-btn")){const l=s.target.dataset.tag;k.has(l)?(k.delete(l),s.target.classList.remove("active")):(k.add(l),s.target.classList.add("active")),f=0,h()}}),t.addEventListener("click",()=>{z=!z,t.checked=z,h()}),n&&n.addEventListener("change",s=>{const l=Array.from(s.target.selectedOptions).map(r=>r.value);w.clear(),l.forEach(r=>{r&&w.add(r)}),h()}),o&&o.addEventListener("change",s=>{const l=Array.from(s.target.selectedOptions).map(r=>r.value);E.clear(),l.forEach(r=>{r&&E.add(r)}),h()}),document.querySelector(".prev-btn").addEventListener("click",()=>{f>0&&(f--,W())}),document.querySelector(".next-btn").addEventListener("click",()=>{f++,W()});let i;window.addEventListener("resize",()=>{clearTimeout(i),i=setTimeout(()=>{b==="blog"&&(f=0,W()),d&&d.invalidateSize()},250)}),Le("blog"),window.addEventListener("scroll",rt()),dt()}function dt(){document.querySelectorAll(".dropdown-filter").forEach(a=>{const t=a.querySelector("h3");function n(){window.innerWidth<=768?a.classList.add("collapsed"):a.classList.remove("collapsed")}n(),window.addEventListener("resize",n),t.addEventListener("click",()=>{window.innerWidth<=768&&a.classList.toggle("collapsed")})})}function ut(){const e=document.getElementById("mapToggle"),a=document.getElementById("mapColumn");e.addEventListener("click",()=>{X=!X,X?(a.classList.add("minimized"),e.textContent="Show Map"):(a.classList.remove("minimized"),e.textContent="Hide Map",d&&setTimeout(()=>d.invalidateSize(),300))})}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("searchInterface")&&ct()});
