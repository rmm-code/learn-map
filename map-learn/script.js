document.addEventListener('DOMContentLoaded', () => {
    const svgMap = document.querySelector('#world-map svg'); // Select SVG correctly
    const countryInfo = document.getElementById('country-info');
    const gameSection = document.getElementById('games-section');
    const learnBtn = document.getElementById('learn-button');
    const gamesBtn = document.getElementById('games-button');
    const playButton = document.getElementById('play-button');
    const targetCountryText = document.getElementById('target-country');
    const scoreText = document.getElementById('score');

    let isGameMode = false;
    let score = 0;
    let targetCountry = "";
    let targetCountryName = "";

    function enableCountryInfo() {
        isGameMode = false;
        countryInfo.style.display = 'block';
        gameSection.style.display = 'none';
    }

    function enableGameMode() {
        isGameMode = false; // Game doesn't start immediately
        countryInfo.style.display = 'none';
        gameSection.style.display = 'block';

        // Hide game elements until Play is pressed
        targetCountryText.style.display = 'none';
        scoreText.style.display = 'none';
    }

    function fetchCountryInfo(countryId) {
        if (isGameMode) return;

        fetch(`https://restcountries.com/v3.1/alpha/${countryId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data[0]) {
                    const country = data[0];
                    const countryName = country.name.common;
                    const flagUrl = country.flags?.png || country.flags?.svg || ''; 
                    const population = country.population?.toLocaleString() || 'N/A';
                    const size = country.area?.toLocaleString() || 'N/A';

                    document.getElementById('country-name').textContent = countryName;
                    
                    const flagElement = document.getElementById('country-flag');
                    flagElement.innerHTML = flagUrl ? 
                        `<img src="${flagUrl}" alt="${countryName} flag" style="width: 150px; height: auto;">` :
                        'Flag not available';

                    document.getElementById('country-population').textContent = `Population: ${population}`;
                    document.getElementById('country-size').textContent = `Size: ${size} km²`;

                    countryInfo.style.display = 'block';
                } else {
                    console.error('No data found for this country');
                }
            })
            .catch(error => console.error('Error fetching country data:', error));
    }

    function startQuizGame() {
        isGameMode = true;

        // Show the game elements
        targetCountryText.style.display = 'block';
        scoreText.style.display = 'block';

        if (!svgMap) {
            console.error('SVG map not loaded yet.');
            return;
        }

        const paths = svgMap.querySelectorAll('path');
        const countryIds = Array.from(paths).map(path => path.id);
        if (countryIds.length === 0) {
            console.error('No countries found in SVG.');
            return;
        }

        // Select a random country
        targetCountry = countryIds[Math.floor(Math.random() * countryIds.length)];

        // Fetch country name before displaying
        fetch(`https://restcountries.com/v3.1/alpha/${targetCountry}`)
            .then(response => response.json())
            .then(data => {
                if (data && data[0]) {
                    targetCountryName = data[0].name.common;
                    targetCountryText.textContent = `Find: ${targetCountryName}`; // Display country name
                    scoreText.textContent = `Score: ${score}`;
                } else {
                    console.error('Could not fetch country name.');
                }
            })
            .catch(error => console.error('Error fetching target country name:', error));

        // Add event listeners for clicking on countries (inside the game)
        paths.forEach(path => {
            path.addEventListener('click', () => {
                const countryId = path.id.toUpperCase();
                if (isGameMode) {
                    if (countryId === targetCountry) {
                        score++;
                        startQuizGame(); // Start a new round
                    }
                }
            });
        });
    }

    // Ensure SVG is loaded before interacting with it
    if (svgMap) {
        const paths = svgMap.querySelectorAll('path');

        // Add event listeners for "Learn" mode
        paths.forEach(path => {
            path.addEventListener('click', () => {
                const countryId = path.id.toUpperCase();
                if (!isGameMode) {
                    fetchCountryInfo(countryId); // Now correctly fetches country info
                }
            });
        });
    } else {
        console.error("SVG map not found.");
    }

    // Event listeners for Learn and Games buttons
    learnBtn.addEventListener('click', enableCountryInfo);
    gamesBtn.addEventListener('click', enableGameMode);
    playButton.addEventListener('click', startQuizGame);
});
