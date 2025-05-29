# Pitchwhile MVP

A single-page web application that allows founders to select a physical activity for pitching to investors.

## Features

- Interactive activity selection cards
- Dynamic form based on selected activity
- Address autocomplete and map preview using Leaflet.js and OpenStreetMap data (Nominatim)
- Calendar integration with Flatpickr
- Responsive design for mobile and desktop

## Customization

### Activities
To modify activities, edit the `activities` array in `js/script.js`:

```javascript
const activities = [
  {
    id: 'run',
    name: 'Run',
    emoji: '🏃',
    color: '#E63946'
  },
  // Add or modify activities here
];
```

### Colors
Activity colors can be modified in the CSS variables in `css/style.css`:

```css
:root {
  --run-color: #E63946;
  --bike-color: #F4A261;
  /* Add or modify colors here */
}
```

## Dependencies

- Leaflet.js (for interactive maps)
- Nominatim (OpenStreetMap's geocoding service for address search)
- Flatpickr (for calendar functionality)
- Inter font (via Google Fonts)

## Credits

Powered by José Andrés Ruiz 
