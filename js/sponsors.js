// Sponsor data - Add new sponsors here
export const sponsors = [
  {
    name: 'TechCorp',
    logo: 'https://placehold.co/200x100/333333/ffffff?text=TechCorp',
    website: 'https://techcorp.com'
  },
  {
    name: 'Innovation Labs',
    logo: 'https://placehold.co/200x100/666666/ffffff?text=Innovation+Labs',
    website: 'https://innovationlabs.com'
  },
  {
    name: 'RoboTech',
    logo: 'https://placehold.co/200x100/999999/ffffff?text=RoboTech',
    website: 'https://robotech.com'
  },
  {
    name: 'Future Systems',
    logo: 'https://placehold.co/200x100/444444/ffffff?text=Future+Systems',
    website: 'https://futuresystems.com'
  },
  {
    name: 'Maker Space',
    logo: 'https://placehold.co/200x100/777777/ffffff?text=Maker+Space',
    website: 'https://makerspace.com'
  },
  {
    name: 'Digital Forge',
    logo: 'https://placehold.co/200x100/555555/ffffff?text=Digital+Forge',
    website: 'https://digitalforge.com'
  }
];

// Initialize sponsor carousel
function initSponsorCarousel() {
  const carouselContainer = document.querySelector('.sponsor-carousel-container');
  if (!carouselContainer) return;

  const carouselTrack = carouselContainer.querySelector('.sponsor-carousel-track');
  
  // Create sponsor items (duplicate for seamless loop)
  const sponsorItems = [...sponsors, ...sponsors].map(sponsor => `
    <div class="sponsor-item">
      <a href="${sponsor.website}" target="_blank" rel="noopener noreferrer">
        <img src="${sponsor.logo}" alt="${sponsor.name}" />
      </a>
    </div>
  `).join('');
  
  carouselTrack.innerHTML = sponsorItems;
  
  // Calculate animation duration based on number of sponsors
  const itemWidth = 220; // 200px + 20px margin
  const totalWidth = sponsors.length * itemWidth;
  const duration = totalWidth / 50; // 50px per second
  
  carouselTrack.style.animationDuration = `${duration}s`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSponsorCarousel);