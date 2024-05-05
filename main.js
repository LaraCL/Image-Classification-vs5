let classifier;
let imageElement;
let previousThumbnail;
let lastResults = []; // Speichern der letzten Ergebnisse

function setup() {
    noCanvas();
    classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    const dropArea = select('#dropArea');
    dropArea.dragOver(() => dropArea.style('background-color', '#ccc'));
    dropArea.dragLeave(() => dropArea.style('background-color', '#fff'));
    dropArea.drop(handleFile, () => dropArea.style('background-color', '#fff'));
}

function modelLoaded() {
    console.log('Model geladen!');
}

function handleFile(file) {
    if (file.type === 'image') {
        imageElement = createImg(file.data, '').hide();
        imageElement.size(400, 400); // Resize image to fit drop area
        const dropArea = select('#dropArea');
        dropArea.html('');
        imageElement.parent(dropArea);
        imageElement.show();
    } else {
        console.log('Nicht unterstützter Dateityp');
    }
}

function classifyImage() {
    if (imageElement) {
        classifier.classify(imageElement, gotResult);
        imageElement.hide(); // Hide image in drop area after classification
        select('#interactionButtons').style('display', 'block'); // Show interaction buttons
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
    } else {
        const confidence = results[0].confidence * 100;
        const label = results[0].label;

        lastResults = results; // Speichern der letzten Ergebnisse für die Interaktionslogik

        const resultContainer = select('#resultContainer');
        resultContainer.html(`
            <div class="custom-bar">
                <div class="confidence-bar" style="width:${confidence * 4}px"></div>
                <div class="confidence-text">${Math.round(confidence)}%</div>
            </div>
            <p class="label-text" style="text-align: center;">${label}</p>
        `);
    }
}

function markCorrect() {
    // Logik zum Markieren als richtig klassifiziert
}

function markIncorrect() {
    // Logik zum Markieren als falsch klassifiziert
}
