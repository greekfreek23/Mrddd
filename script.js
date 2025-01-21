(function(){
  // 1) Get ?site= parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');
  if(!siteParam) {
    console.warn("No ?site= provided in URL. Page won't populate data.");
    return;
  }

  // Remove single quotes, then slugify
  const normalizedSlug = siteParam
    .replace(/'/g, '')           // remove apostrophes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');

  // 2) Construct URL for the individual business JSON file
  const BASE_URL = "https://raw.githubusercontent.com/greekfreek23/Mrddd/main/data/businesses/";
  const DATA_URL = `${BASE_URL}${normalizedSlug}.json`; 
  // Assumes filename matches the slug (e.g., brian-harden-plumbing-inc.json)

  fetch(DATA_URL)
    .then(resp => {
      if(!resp.ok) {
        throw new Error("Failed to load " + normalizedSlug + ".json: " + resp.status);
      }
      return resp.json();
    })
    .then(data => {
      if(!data) {
        console.warn("No data found in the JSON file for:", normalizedSlug);
        return;
      }
      initializeSite(data);
    })
    .catch(err => {
      console.error("Error loading or parsing JSON file:", err);
    });

  function initializeSite(data){
    console.log("Loaded business data:", data);

    // Example: Update theming colors based on siteConfigs if they exist
    if(data.siteConfigs?.SecondaryColor) {
      document.documentElement.style.setProperty('--primary-color', data.siteConfigs.SecondaryColor);
    }
    if(data.siteConfigs?.PrimaryColor) {
      document.documentElement.style.setProperty('--accent-color', data.siteConfigs.PrimaryColor);
    }

    // Fill placeholders using data available in the JSON
    // Business Name
    const businessName = data.businessName || data.siteConfigs?.name || "Default Business";
    document.querySelectorAll("[data-business-name]").forEach(el => {
      el.textContent = businessName;
    });

    // Phone Number
    const phone = data.siteConfigs?.phone || "(555) 123-4567";
    document.querySelectorAll("[data-phone]").forEach(el => {
      el.textContent = phone;
      if(el.tagName.toLowerCase() === 'a'){
        el.href = "tel:" + phone.replace(/\D/g, '');
      }
    });

    // Email Address (if available; otherwise fallback)
    const email = data.siteConfigs?.email || "info@example.com";
    document.querySelectorAll("[data-email]").forEach(el => {
      el.textContent = email;
      if(el.tagName.toLowerCase() === 'a'){
        el.href = "mailto:" + email;
      }
    });

    // Populate About Us text if available
    if(data.aboutUs) {
      const aboutContainer = document.getElementById('about-us');
      if(aboutContainer) {
        aboutContainer.textContent = data.aboutUs;
      }
    }

    // Populate Why Choose Us section if available
    if(data.whyChooseUs) {
      const whyChooseContainer = document.getElementById('why-choose-us');
      if(whyChooseContainer) {
        // Main pitch
        const pitchEl = document.createElement('p');
        pitchEl.className = 'main-pitch';
        pitchEl.textContent = data.whyChooseUs.mainPitch;
        whyChooseContainer.appendChild(pitchEl);

        // Selling points
        if(Array.isArray(data.whyChooseUs.sellingPoints)) {
          const ul = document.createElement('ul');
          data.whyChooseUs.sellingPoints.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            ul.appendChild(li);
          });
          whyChooseContainer.appendChild(ul);
        }
      }
    }

    // Initialize Hero Section images and texts if available
    if(data.heroSection && Array.isArray(data.heroSection)) {
      initHeroSection(data.heroSection);
    }

    // Further initialization as needed...
    // For example: initializing reviews, aboutUsSection images, etc.
  }

  // Helper to initialize the hero section
  function initHeroSection(heroItems) {
    const heroContainer = document.getElementById('hero-section');
    if(!heroContainer) return;

    // Clear any existing content
    heroContainer.innerHTML = "";

    heroItems.forEach(item => {
      // Create a wrapper div for each hero item
      const itemDiv = document.createElement('div');
      itemDiv.className = "hero-item";

      // Create image element
      if(item.imageIndex) {
        const img = document.createElement('img');
        img.src = item.imageIndex;
        img.alt = item.description || "Hero image";
        itemDiv.appendChild(img);
      }

      // Create description paragraph if available
      if(item.description) {
        const desc = document.createElement('p');
        desc.textContent = item.description;
        itemDiv.appendChild(desc);
      }

      // Create call-to-action button if available
      if(item.callToAction) {
        const btn = document.createElement('button');
        btn.textContent = item.callToAction;
        // You might want to add a click event to handle action (e.g., open contact form)
        itemDiv.appendChild(btn);
      }

      heroContainer.appendChild(itemDiv);
    });
  }

  // You can add additional helper functions for other sections,
  // for example, to initialize customer reviews based on data.googleReviewsBySlug.json,
  // or to set up the aboutUsSection images.

})();

