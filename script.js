// script.js
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
  // Assumes filename matches the slug (e.g., a-revolution-llc.json)

  fetch(DATA_URL)
    .then(resp => {
      if(!resp.ok) {
        throw new Error("Failed to load " + normalizedSlug + ".json: " + resp.status);
      }
      return resp.json();
    })
    .then(data => {
      // If the JSON structure is the business data directly
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
    const bn = data.businessName || data.siteConfigs?.name || "Default Business";
    document.querySelectorAll("[data-business-name]").forEach(el => {
      el.textContent = bn;
    });

    // phone
    const phone = data.siteConfigs?.phone || "(555) 123-4567";
    document.querySelectorAll("[data-phone]").forEach(el => {
      el.textContent = phone;
      if(el.tagName.toLowerCase() === 'a'){
        el.href = "tel:" + phone.replace(/\D/g, '');
      }
    });

    // email
    const email = data.siteConfigs?.email || "info@example.com";
    document.querySelectorAll("[data-email]").forEach(el => {
      el.textContent = email;
      if(el.tagName.toLowerCase() === 'a'){
        el.href = "mailto:" + email;
      }
    });

    // Continue populating other elements similarly...
    // For example, update ratings, reviews, about us text, images, etc.
    // This part will depend on your HTML structure and JSON schema.

    // You can reuse or adapt functions like initHeroImages, initReviews, etc. as needed.
  }

  // Include any additional helper functions as necessary, 
  // such as initHeroImages, initReviews, etc., adjusted for the new JSON format if necessary.

})();
