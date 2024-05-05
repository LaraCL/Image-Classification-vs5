let classifier;
let imageElement;
let imageThumbnail;
let correctClassifications = [];
let incorrectClassifications = [];

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
        if (imageThumbnail) {
            imageThumbnail.remove();
        }
        imageThumbnail = createImg(file.data, '').hide();
        imageThumbnail.parent('dropArea');
        imageThumbnail.style('max-width', '400px'); // Maximale Breite für das Thumbnail
        imageThumbnail.style('height', 'auto'); // Erhalt des Seitenverhältnisses
        imageThumbnail.show();
    } else {
        console.log('Nicht unterstützter Dateityp');
    }
}

function classifyImage() {
    if (imageThumbnail) {
        classifier.classify(imageThumbnail, gotResult);
        imageThumbnail.hide(); // Verberge Thumbnail im Drop-Bereich nach der Klassifikation
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
    } else {
        const confidence = results[0].confidence * 100;
        const label = results[0].label;

        const data = {
            src: imageThumbnail.elt.src,
            label: label,
            confidence: confidence
        };

        // Anzeige des Ergebnisses
        const resultContainer = select('#imageSection');
        resultContainer.html(`
            <img src="${data.src}" style="max-width: 100px; height: auto;">
            <p>${label} - ${Math.round(confidence)}%</p>
        `);

        // Füge die Klassifizierung zu den Listen hinzu
        addClassificationResult(data);
    }
}

function addClassificationResult(data) {
    correctClassifications.unshift(data);
    if (correctClassifications.length > 3) correctClassifications.pop();
    incorrectClassifications.unshift(data);
    if (incorrectClassifications.length > 3) incorrectClassifications.pop();

    updateClassificationDisplay();
}

function updateClassificationDisplay() {
    updateClassificationList('#classifiedCorrectly', correctClassifications);
    updateClassificationList('#classifiedIncorrectly', incorrectClassifications);
}

function updateClassificationList(selector, list) {
    const container = select(selector);
    container.html('<h2>' + (selector.includes('Correct') ? 'Richtig' : 'Falsch') + ' klassifizierte Bilder</h2>');
    list.forEach(result => {
        container.child(`
            <div>
                <img src="${result.src}" style="max-width: 100px; height: auto;">
                <p>${result.label} - ${Math.round(result.confidence)}%</p>
            </div>
        `);
    });
}
