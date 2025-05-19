import { blogPosts } from './blogData.js';

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

// Process content paragraphs while preserving code blocks
const processContent = (content) => {
  // Split content into segments (code blocks and regular text)
  const segments = content.split(/(```\w*\n[\s\S]*?```)/);
  
  return segments.map(segment => {
    // If this is a code block, process it
    if (segment.startsWith('```')) {
      return processCodeBlocks(segment);
    }
    // Otherwise wrap non-empty lines in paragraph tags
    return segment
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('');
  }).join('\n');
};

// Get post ID from URL parameters
const getPostId = () => {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
};

// Display blog post
const displayPost = () => {
  const postId = getPostId();
  const post = blogPosts.find(p => p.id === postId);
  
  if (!post) {
    window.location.href = 'index.html';
    return;
  }

  const blogPostContainer = document.getElementById('blogPost');
  
  blogPostContainer.innerHTML = `
    <div class="blog-header">
      <div class="blog-image">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <h1>${post.title}</h1>
      <div class="blog-meta">
        <span class="blog-date">${new Date(post.date).toLocaleDateString()}</span>
        <span class="blog-author">By ${post.author}</span>
      </div>
      <div class="tags">
        ${post.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
    <div class="blog-content">
      ${processContent(post.content)}
    </div>
  `;

  // Highlight any code blocks
  Prism.highlightAll();

  document.title = `${post.title} - Makers Club`;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', displayPost);