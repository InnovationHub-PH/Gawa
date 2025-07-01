import"./auth-DasK3Pgx.js";import{b as i}from"./blogData-BZ1nJePQ.js";const l=e=>e.replace(/```(\w+)?\n([\s\S]*?)```/g,(t,n,s)=>{const a=n||"plaintext",o=Prism.highlight(s.trim(),Prism.languages[a]||Prism.languages.plaintext,a);return`<pre class="language-${a}"><code class="language-${a}">${o}</code></pre>`}),r=e=>e.split(/(```\w*\n[\s\S]*?```)/).map(n=>n.startsWith("```")?l(n):n.split(`
`).map(s=>s.trim()).filter(s=>s.length>0).map(s=>`<p>${s}</p>`).join("")).join(`
`),c=()=>{const e=new URLSearchParams(window.location.search);return parseInt(e.get("id"))},g=()=>{const e=c(),t=i.find(s=>s.id===e);if(!t){window.location.href="index.html";return}const n=document.getElementById("blogPost");n.innerHTML=`
    <div class="blog-header">
      <div class="blog-image">
        <img src="${t.image}" alt="${t.title}">
      </div>
      <h1>${t.title}</h1>
      <div class="blog-meta">
        <span class="blog-date">${new Date(t.date).toLocaleDateString()}</span>
        <span class="blog-author">By ${t.author}</span>
      </div>
      <div class="tags">
        ${t.tags.map(s=>`<span class="tag">${s.toUpperCase()}</span>`).join("")}
      </div>
    </div>
    <div class="blog-content">
      ${r(t.content)}
    </div>
  `,Prism.highlightAll(),document.title=`${t.title} - Makers Club`};document.addEventListener("DOMContentLoaded",g);
