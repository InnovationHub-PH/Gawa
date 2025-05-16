import { blogPosts } from './blogData.js';
import Prism from 'prismjs';

// Import additional languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-kotlin';

// Get unique tags from blog posts
const getAllTags = () => {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
};

// Process code blocks in content
const processCodeBlocks = (content) => {
  return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlighted = Prism.highlight(
      code.trim(),
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
    return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
  });
};

// Create blog post card
const createBlogCard = (post) => {
  const processedContent = processCodeBlocks(post.content);
  const firstParagraph = post.content.split('\n')[0];
  
  return `
    <a href="post.html?id=${post.id}" class="card blog-card" data-tags="${post.tags.join(' ')}">
      <div class="blog-image">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="blog-content">
        <h3>${post.title}</h3>
        <div class="blog-meta">
          <span class="blog-date">${new Date(post.date).toLocaleDateString()}</span>
          <span class="blog-author">By ${post.author}</span>
        </div>
        <p>${firstParagraph}</p>
        <div class="tags">
          ${post.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
};

// Initialize blog section
const initBlog = () => {
  const blogTagsContainer = document.getElementById('blogTags');
  const blogPostsContainer = document.getElementById('blogPosts');
  const searchInput = document.getElementById('blogSearch');
  let activeFilters = new Set();
  let currentPage = 0;

  // Add navigation controls
  const navControls = document.createElement('div');
  navControls.className = 'blog-nav';
  navControls.innerHTML = `
    <button class="nav-btn prev-btn">←</button>
    <button class="nav-btn next-btn">→</button>
  `;
  blogPostsContainer.parentNode.insertBefore(navControls, blogPostsContainer.nextSibling);

  const prevBtn = navControls.querySelector('.prev-btn');
  const nextBtn = navControls.querySelector('.next-btn');

  // Add tag buttons
  getAllTags().forEach(tag => {
    const button = document.createElement('button');
    button.className = 'tag-btn';
    button.textContent = tag.toUpperCase();
    button.dataset.tag = tag;
    blogTagsContainer.appendChild(button);
  });

  // Filter and display posts
  const updatePosts = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPosts = blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      const matchesTags = 
        activeFilters.size === 0 || 
        post.tags.some(tag => activeFilters.has(tag));

      return matchesSearch && matchesTags;
    });

    const postsPerPage = window.innerWidth <= 768 ? 1 : 3;
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    // Ensure current page is valid
    if (currentPage >= totalPages) {
      currentPage = Math.max(0, totalPages - 1);
    }

    // Get posts for current page
    const startIndex = currentPage * postsPerPage;
    const visiblePosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

    // Update navigation buttons
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    blogPostsContainer.innerHTML = visiblePosts.map(createBlogCard).join('');
    
    // Highlight code blocks in visible posts
    Prism.highlightAll();
  };

  // Event listeners
  searchInput.addEventListener('input', updatePosts);

  blogTagsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-btn')) {
      const tag = e.target.dataset.tag;
      if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
        e.target.classList.remove('active');
      } else {
        activeFilters.add(tag);
        e.target.classList.add('active');
      }
      currentPage = 0;
      updatePosts();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updatePosts();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    updatePosts();
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentPage = 0;
      updatePosts();
    }, 250);
  });

  // Initial render
  updatePosts();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlog);