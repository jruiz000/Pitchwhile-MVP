// Activity data
const activities = [
    {
        id: 'run',
        name: 'Run',
        emoji: '🏃',
        color: '#DD5E56'
    },
    {
        id: 'bike',
        name: 'Bike',
        emoji: '🚴',
        color: '#F4A261'
    },
    {
        id: 'lift',
        name: 'Lift',
        emoji: '🏋️',
        color: '#457B9D'
    },
    {
        id: 'yoga',
        name: 'Yoga/Pilates',
        emoji: '🧘',
        color: '#2A9D8F'
    },
    {
        id: 'walk',
        name: 'Walk & Talk',
        emoji: '🚶',
        color: '#6D6875'
    },
    {
        id: 'coffee',
        name: 'Coffee Chat',
        emoji: '☕',
        color: '#8E7DBE'
    }
];

// DOM Elements
const activitiesGrid = document.querySelector('.activities-grid');
const activitySelection = document.getElementById('activity-selection');
const formScreen = document.getElementById('form-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const activityTitle = document.getElementById('activity-title');
const previewActivity = document.getElementById('preview-activity');
const previewLocation = document.getElementById('preview-location');
const previewTime = document.getElementById('preview-time');
const previewStartup = document.getElementById('preview-startup');
const pitchForm = document.getElementById('pitch-form');
const confirmationTitle = document.getElementById('confirmation-title');
const shareBtn = document.getElementById('share-btn');
const backButtons = document.querySelectorAll('.back-btn');
const timeSlotsContainer = document.getElementById('time-slots');
const datetimeInput = document.getElementById('datetime');
const locationInput = document.getElementById('location');
const mapPreview = document.getElementById('map-preview');

let selectedTime = null;

// Initialize map
let map;
let marker;
let searchTimeout;

function initMap() {
    // Initialize map centered on CDMX
    map = L.map('map-preview').setView([19.4326, -99.1332], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize marker
    marker = L.marker([19.4326, -99.1332]).addTo(map);
}

// Initialize the application
function init() {
    renderActivities();
    initializeCalendar();
    setupEventListeners();
    initMap();
}

// Render activity cards
function renderActivities() {
    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.setAttribute('data-activity', activity.id);
        card.innerHTML = `
            <div class="emoji">${activity.emoji}</div>
            <div class="name">${activity.name}</div>
        `;
        card.addEventListener('click', () => selectActivity(activity));
        activitiesGrid.appendChild(card);
    });
}

// Handle activity selection
function selectActivity(activity) {
    // Add selected class to the clicked card
    document.querySelectorAll('.activity-card').forEach(card => {
        card.classList.remove('selected');
    });
    const selectedCard = document.querySelector(`[data-activity="${activity.id}"]`);
    selectedCard.classList.add('selected');

    // Set the current color for buttons and background
    document.documentElement.style.setProperty('--current-color', activity.color);
    document.body.style.backgroundColor = activity.color;

    // Update screens with activity data with a slight delay for animation
    setTimeout(() => {
        activitySelection.classList.remove('active');
        formScreen.classList.add('active');
        formScreen.setAttribute('data-activity', activity.id);
        confirmationScreen.setAttribute('data-activity', activity.id);
    }, 500); // Match this delay with CSS transition duration

    activityTitle.textContent = `Pitch me your startup while we ${activity.name.toLowerCase()} ${activity.emoji}`;
    previewActivity.textContent = activity.name;
    document.querySelector('.preview-icon').textContent = activity.emoji;

    // Reset calendar and time slots and location
    datetimeInput._flatpickr.clear();
    timeSlotsContainer.innerHTML = '';
    previewTime.textContent = 'Select a time';
    selectedTime = null;
    locationInput.value = '';
    previewLocation.textContent = 'Select a location';
    mapPreview.textContent = 'Map Preview Placeholder'; // Reset map preview text
}

// Initialize Calendar
function initializeCalendar() {
    flatpickr(datetimeInput, {
        enableTime: false, // Disable time selection initially
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(10), // 10 days from now
        onClose: function(selectedDates, dateStr) {
            if (selectedDates.length > 0) {
                renderTimeSlots(selectedDates[0]);
                updatePreview();
            }
        }
    });
}

// Render time slots based on selected date
function renderTimeSlots(selectedDate) {
    timeSlotsContainer.innerHTML = ''; // Clear previous time slots
    selectedTime = null;

    const times = [
        '07:00', '07:30', '08:00', '08:30',
        '17:00', '17:30', '18:00', '18:30'
    ]; // Example time blocks

    times.forEach(time => {
        const timeSlotBtn = document.createElement('button');
        timeSlotBtn.className = 'time-slot-btn';
        timeSlotBtn.textContent = time;
        timeSlotBtn.addEventListener('click', () => selectTimeSlot(timeSlotBtn, time, selectedDate));
        timeSlotsContainer.appendChild(timeSlotBtn);
    });
}

// Handle time slot selection
function selectTimeSlot(clickedButton, time, selectedDate) {
    document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
    clickedButton.classList.add('selected');
    selectedTime = time;
    updatePreview();
}

// Setup form event listeners
function setupEventListeners() {
    // Update preview as user types
    document.getElementById('founder-name').addEventListener('input', updatePreview);
    document.getElementById('startup-name').addEventListener('input', updatePreview);
    document.getElementById('one-liner').addEventListener('input', updatePreview);
    locationInput.addEventListener('input', function(e) {
        console.log('Location input event fired', e.target.value);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value;
            if (query.length > 3) {
                console.log('Searching for:', query);
                searchLocation(query);
            }
        }, 500);
    });
    
    // Handle form submission
    pitchForm.addEventListener('submit', handleFormSubmit);

    // Handle share button
    shareBtn.addEventListener('click', handleShare);

    // Handle back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', handleBack);
    });
}

// Update preview card
function updatePreview() {
    const founderName = document.getElementById('founder-name').value;
    const startupName = document.getElementById('startup-name').value;
    const oneLiner = document.getElementById('one-liner').value;

    if (founderName && startupName) {
        previewStartup.textContent = `${startupName} by ${founderName}`;
    } else if (founderName) {
        previewStartup.textContent = `By ${founderName}`;
    } else if (startupName) {
        previewStartup.textContent = `${startupName}`;
    } else {
        previewStartup.textContent = 'Enter your startup details';
    }

    const selectedDate = datetimeInput.value;
    if (selectedDate && selectedTime) {
        previewTime.textContent = `${selectedDate} ${selectedTime}`;
    } else if (selectedDate) {
        previewTime.textContent = `${selectedDate} Select a time`;
    } else {
        previewTime.textContent = 'Select a time';
    }
}

// Update location preview and map placeholder
function updateLocationPreview() {
    const locationValue = locationInput.value;
    previewLocation.textContent = locationValue || 'Select a location';
    if (locationValue) {
        // For a basic MVP without API, just display the text in the map preview
        mapPreview.textContent = `Location: ${locationValue}`; 
        // If you wanted to try a static map image, you could construct a URL here
        // using a service like OpenStreetMap's static map, but it's limited.
        // Example (requires more robust URL encoding and handling): 
        // mapPreview.innerHTML = `<img src="https://www.openstreetmap.org/staticmap?center=0,0&zoom=1&size=200x200&marker=0,0&mml=${encodeURIComponent(locationValue)}" alt="Map preview">`;
    } else {
        mapPreview.textContent = 'Map Preview Placeholder';
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        activity: previewActivity.textContent,
        location: previewLocation.textContent, // This now comes from the simple input
        time: previewTime.textContent, // This will now include date and selected time
        founder: document.getElementById('founder-name').value,
        startup: document.getElementById('startup-name').value,
        oneLiner: document.getElementById('one-liner').value,
        url: document.getElementById('startup-url').value,
        question: document.getElementById('investor-question').value
    };

    // Add success animation
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.innerHTML = '✓';
    submitBtn.classList.add('success-check');

    // Show confirmation screen after animation
    setTimeout(() => {
        formScreen.classList.remove('active');
        confirmationScreen.classList.add('active');
        
        // Update confirmation message
        confirmationTitle.textContent = `¡Listo! Tu pitch para '${formData.activity}' fue registrado. René lo revisará y te contactará pronto si eres seleccionado.`;
        
        // Copy preview card to confirmation screen
        const confirmationPreview = confirmationScreen.querySelector('.preview-card');
        confirmationPreview.innerHTML = document.querySelector('.preview-card').innerHTML;
    }, 500);
}

// Handle back button
function handleBack() {
    if (formScreen.classList.contains('active')) {
        formScreen.classList.remove('active');
        activitySelection.classList.add('active');
        document.querySelector('.activity-card.selected')?.classList.remove('selected');
        document.body.style.backgroundColor = ''; // Reset background color
        // Reset form fields when going back from form screen
        pitchForm.reset();
        timeSlotsContainer.innerHTML = '';
        previewLocation.textContent = 'Select a location';
        previewTime.textContent = 'Select a time';
        previewStartup.textContent = 'Enter your startup details';
        mapPreview.textContent = 'Map Preview Placeholder';
        selectedTime = null;
    } else if (confirmationScreen.classList.contains('active')) {
        confirmationScreen.classList.remove('active');
        formScreen.classList.add('active');
        // Note: Form data persists when going back from confirmation to form
    }
}

// Handle share button
function handleShare() {
    const shareText = `¡Acabo de solicitar un pitch mientras hacemos ${previewActivity.textContent}! 🚀`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Pitchwhile',
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const mailtoLink = `mailto:?subject=Pitchwhile&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.location.href = mailtoLink;
    }
}

// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Add event listener for location input
    const locationInput = document.getElementById('location');
    locationInput.addEventListener('input', function(e) {
        console.log('Location input event fired', e.target.value);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value;
            if (query.length > 3) {
                console.log('Searching for:', query);
                searchLocation(query);
            }
        }, 500);
    });
});

async function searchLocation(query) {
    console.log('searchLocation called with query:', query);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Ciudad de México, México')}&limit=1`);
        console.log('Nominatim API response:', response);
        const data = await response.json();
        console.log('Nominatim API data:', data);
        
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            console.log('Location found:', lat, lon);
            updateMap(lat, lon);
        } else {
            console.log('No location found for query:', query);
        }
    } catch (error) {
        console.error('Error searching location:', error);
    }
}

function updateMap(lat, lon) {
    console.log('updateMap called with:', lat, lon);
    // Update marker position
    marker.setLatLng([lat, lon]);
    
    // Center map on new location
    map.setView([lat, lon], 15);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 
