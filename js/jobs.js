// Sample job data - Replace with your actual job data
export const jobs = [
    {
        title: 'Job Title',
        company: 'Company Name',
        logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
        location: 'Makati, MNL',
        remote: false,
        tags: ['robotics', 'hardware'],
        description: 'Describe the Job openning here...'
    },
    {
        title: 'Software Developer',
        company: 'Remote Robotics',
        logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
        location: 'Remote',
        remote: true,
        tags: ['software', 'robotics'],
        description: 'Developing control systems for autonomous robots. We are looking for a skilled software developer with experience in robotics and control systems. The ideal candidate will have a strong background in Python, C++, and ROS. You will be working with a team of engineers to develop and implement control algorithms for our autonomous robot fleet. Key responsibilities include: developing and maintaining robot control software, implementing new features and functionality, debugging and troubleshooting issues, and collaborating with the hardware team.'
    },
    {
        title: 'Mechatronics Intern',
        company: 'Innovation Labs',
        logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
        location: 'Boston, MA',
        remote: false,
        tags: ['internship', 'hardware', 'software'],
        description: 'Summer internship opportunity in our robotics division. Join our team of experts and gain hands-on experience in robotics development.'
    },
    {
        title: 'Control Systems Engineer',
        company: 'Virtual Mechanics',
        logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
        location: 'Remote',
        remote: true,
        tags: ['software', 'hardware'],
        description: 'Design and implement control systems for industrial robots. Work with cutting-edge technology and collaborate with a global team.'
    }
];

// State
let activeFilters = new Set();
let remoteOnly = false;
let searchTerm = '';

// DOM Elements
const jobsList = document.getElementById('jobsList');
const tagButtons = document.querySelectorAll('.tag-btn');
const remoteToggle = document.getElementById('remoteToggle');
const searchInput = document.getElementById('searchInput');

// Functions
function truncateWords(text, wordCount) {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
}

function validateDescription(description) {
    const words = description.split(' ');
    if (words.length > 850) {
        return words.slice(0, 850).join(' ') + '...';
    }
    return description;
}

function createJobCard(job) {
    const truncatedDescription = truncateWords(job.description, 11);
    const fullDescription = validateDescription(job.description);
    const isExpanded = truncatedDescription === fullDescription;

    return `
        <div class="card">
            <div class="card-header">
                <img src="${job.logo}" alt="${job.company} logo" class="card-logo">
                <div class="title-info">
                    <h3>${job.title}</h3>
                    <h4>${job.company}</h4>
                    <p class="location">${job.location}</p>
                </div>
            </div>
            <div class="tags">
                ${job.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
            </div>
            <div class="description-container">
                <p class="description truncated">${truncatedDescription}</p>
                <p class="description full" style="display: none;">${fullDescription}</p>
                ${!isExpanded ? `<button class="read-more">READ MORE</button>` : ''}
            </div>
            <a href="#" class="sqr-btn">APPLY NOW</a>
        </div>
    `;
}

function filterJobs() {
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        if (!matchesSearch) return false;
        if (remoteOnly && !job.remote) return false;
        if (activeFilters.size === 0) return true;
        return job.tags.some(tag => activeFilters.has(tag));
    });

    jobsList.innerHTML = filteredJobs.map(createJobCard).join('');
    
    // Add event listeners to read more buttons
    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', function(e) {
            const container = this.closest('.description-container');
            const truncated = container.querySelector('.truncated');
            const full = container.querySelector('.full');
            
            if (truncated.style.display !== 'none') {
                truncated.style.display = 'none';
                full.style.display = 'block';
                this.textContent = 'READ LESS';
            } else {
                truncated.style.display = 'block';
                full.style.display = 'none';
                this.textContent = 'READ MORE';
            }
        });
    });
}

// Event Listeners
tagButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        if (activeFilters.has(tag)) {
            activeFilters.delete(tag);
            button.classList.remove('active');
        } else {
            activeFilters.add(tag);
            button.classList.add('active');
        }
        filterJobs();
    });
});

remoteToggle.addEventListener('click', () => {
    remoteOnly = !remoteOnly;
    remoteToggle.checked = remoteOnly;
    filterJobs();
});

searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterJobs();
});

// Initial render
filterJobs();