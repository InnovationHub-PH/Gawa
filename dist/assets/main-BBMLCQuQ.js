import"./auth-DasK3Pgx.js";const e=[{name:"TechCorp",logo:"https://placehold.co/200x100/333333/ffffff?text=TechCorp",website:"https://techcorp.com"},{name:"Innovation Labs",logo:"https://placehold.co/200x100/666666/ffffff?text=Innovation+Labs",website:"https://innovationlabs.com"},{name:"RoboTech",logo:"https://placehold.co/200x100/999999/ffffff?text=RoboTech",website:"https://robotech.com"},{name:"Future Systems",logo:"https://placehold.co/200x100/444444/ffffff?text=Future+Systems",website:"https://futuresystems.com"},{name:"Maker Space",logo:"https://placehold.co/200x100/777777/ffffff?text=Maker+Space",website:"https://makerspace.com"},{name:"Digital Forge",logo:"https://placehold.co/200x100/555555/ffffff?text=Digital+Forge",website:"https://digitalforge.com"}];function c(){const o=document.querySelector(".sponsor-carousel-container");if(!o)return;const s=o.querySelector(".sponsor-carousel-track"),n=[...e,...e].map(t=>`
    <div class="sponsor-item">
      <a href="${t.website}" target="_blank" rel="noopener noreferrer">
        <img src="${t.logo}" alt="${t.name}" />
      </a>
    </div>
  `).join("");s.innerHTML=n;const a=e.length*220/50;s.style.animationDuration=`${a}s`}document.addEventListener("DOMContentLoaded",c);
