// Selecteer de container
const videoContainer = document.getElementById('videoContainer');

// Mapping van letters naar GIF-bestanden
const letterGifMap = {
    "a": "videos/a.gif",
    "b": "videos/b.gif",
    "c": "videos/c.gif",
    "d": "videos/d.gif",
    "e": "videos/e.gif",
    "f": "videos/f.gif",
    "g": "videos/g.gif",
    "h": "videos/h.gif",
    "i": "videos/i.gif",
    "j": "videos/j.gif",
    "k": "videos/k.gif",
    "l": "videos/l.gif",
    "m": "videos/m.gif",
    "n": "videos/n.gif",
    "o": "videos/o.gif",
    "p": "videos/p.gif",
    "q": "videos/q.gif",
    "r": "videos/r.gif",
    "s": "videos/s.gif",
    "t": "videos/t.gif",
    "u": "videos/u.gif",
    "v": "videos/v.gif",
    "w": "videos/w.gif",
    "x": "videos/x.gif",
    "y": "videos/y.gif",
    "z": "videos/z.gif"
};

// Opslag voor actieve GIF's
const activeGifs = {};

// Functie om audio volume te meten
async function setupAudioMeter() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    microphone.connect(analyser);

    return () => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        return volume;
    };
}

// Functie om GIF's te tonen met grootte op basis van volume
function showGif(gifUrl, volume) {
    const img = document.createElement('img');
    img.src = gifUrl;
    img.style.position = 'absolute';

    // Stel de grootte van de GIF in op basis van volume
    let sizePercentage;
    if (volume < 20) {
        sizePercentage = "20%"; // Klein formaat bij fluisteren
    } else if (volume < 30) {
        sizePercentage = "50%"; // Normaal formaat bij normaal praten
    } else {
        sizePercentage = "100%"; // Groot formaat bij luid praten
    }
    img.style.width = sizePercentage;
    img.style.height = "auto";

    // Willekeurige plaatsing op het scherm
    img.style.left = `${Math.random() * 70}vw`;
    img.style.top = `${Math.random() * 70}vh`;

    // Voeg GIF toe aan de container
    videoContainer.appendChild(img);

    // Verwijder GIF na 6 seconden
    setTimeout(() => {
        videoContainer.removeChild(img);
    }, 6000);
}

// Start spraakherkenning
(async () => {
    const getVolume = await setupAudioMeter();

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'nl-NL'; // Nederlands
        recognition.continuous = true; // Blijf luisteren
        recognition.interimResults = true; // Gebruik tussentijdse resultaten

        recognition.onresult = async (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            const letters = transcript.split('');

            for (const letter of letters) {
                if (letterGifMap[letter] && !activeGifs[letter]) {
                    const volume = await getVolume(); // Volume wordt direct gemeten
                    activeGifs[letter] = true;
                    showGif(letterGifMap[letter], volume);

                    setTimeout(() => {
                        delete activeGifs[letter];
                    }, 6000);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Fout:", event.error);
            recognition.start();
        };

        recognition.onend = () => {
            recognition.start();
        };

        recognition.start();
    } else {
        alert("Spraakherkenning wordt niet ondersteund in deze browser.");
    }
})();
