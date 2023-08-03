// app.js
const APOD_API_KEY = 'OR2IcmT1D2hPPEvwZr9vZy67rs9rAWLXw5pl447g'; // Replace with your API key
const defaultDate = new Date().toISOString().split('T')[0];

const datePicker = document.getElementById('datePicker');
const viewButton = document.getElementById('viewButton');
const downloadButton = document.getElementById('downloadButton');
const apodContainer = document.getElementById('apod-container');

// Function to handle image download when the user clicks the "Download Image" button
function handleImageDownload() {
    const apodImage = document.querySelector('.apod-image');
    const downloadLink = document.createElement('a');
    downloadLink.href = apodImage.src;
    downloadLink.download = 'apod_image.jpg';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Attach event listener to the "Download Image" button
downloadButton.addEventListener('click', handleImageDownload);

// Function to fetch APOD data for a specific date
async function fetchAPODByDate(date) {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${APOD_API_KEY}&date=${date}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching APOD data:', error);
        return null;
    }
}

// Function to render APOD content on the webpage
function renderAPOD(data) {
    apodContainer.innerHTML = '';

    const apodImage = document.createElement('img');
    apodImage.classList.add('apod-image');
    apodImage.src = data.url;
    apodImage.alt = data.title;
    apodContainer.appendChild(apodImage);

    const apodTitle = document.createElement('div');
    apodTitle.classList.add('apod-title');
    apodTitle.textContent = data.title;
    apodContainer.appendChild(apodTitle);

    const apodExplanation = document.createElement('div');
    apodExplanation.classList.add('apod-explanation');
    apodExplanation.textContent = data.explanation;
    apodContainer.appendChild(apodExplanation);

    // Call the 3D view function here
    handle3DView(data);
}

// Function to handle 3D view of the APOD image using Three.js
function handle3DView(data) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 400);

    const apod3DContainer = document.createElement('div');
    apod3DContainer.id = 'apod-3d-container';
    apod3DContainer.appendChild(renderer.domElement);

    apodContainer.innerHTML = '';
    apodContainer.appendChild(apod3DContainer);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(data.url, texture => {
        const aspectRatio = texture.image.width / texture.image.height;
        const geometry = new THREE.BoxGeometry(aspectRatio, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 2;

        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }

        // Wait for the image to load before starting the animation
        texture.image.onload = () => {
            animate();
        };
    });
}

// Function to fetch APOD data and render it on the webpage
async function displayAPOD() {
    const apodData = await fetchAPODByDate(defaultDate);
    if (apodData) {
        renderAPOD(apodData);
    }
}

// Function to handle date selection and fetch APOD data for the chosen date
async function handleDateSelection() {
    const selectedDate = datePicker.value || defaultDate;
    const apodData = await fetchAPODByDate(selectedDate);
    if (apodData) {
        renderAPOD(apodData);
    }
}

// Attach event listeners
viewButton.addEventListener('click', handleDateSelection);
datePicker.addEventListener('change', handleDateSelection);
window.addEventListener('load', displayAPOD);

// Fetch APOD data for the default date when the page loads
handleDateSelection();