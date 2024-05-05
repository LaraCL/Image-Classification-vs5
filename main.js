let classifier;
let imageElement;
let imageThumbnail; // Thumbnail des aktuellen Bildes
let lastResult; // Speichert das letzte Klassifikationsergebnis
let correctClassifications = [];
let incorrectClassifications = [];

function setup() {
    noCanvas();
    classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    const dropArea = select('#dropArea');
    dropArea.dragOver(() => dropArea.style('background-color', '#ccc'));
    dropArea.dragLeave(() => dropArea.style('background-color', '#fff'));
    dropArea.drop(handleFile, () => dropArea.style('background-color', '#fff'));
    loadClassifiedCases(); // Lade gespeicherte Fälle beim Initialisieren
}

function modelLoaded() {
    console.log('Model geladen!');
}

function handleFile(file) {
    if (file.type === 'image') {
        imageElement = createImg(file.data, '').hide();
        imageElement.size(400, 400); // Anpassung an feste Größe des Drop-Bereichs
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
        imageElement.hide(); // Verberge Bild im Drop-Bereich nach der Klassifikation
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
    } else {
        const confidence = results[0].confidence * 100;
        const label = results[0].label;

        // Thumbnail für Ergebnisbereich erstellen und altes Thumbnail ersetzen
        if (imageThumbnail) {
          imageThumbnail.remove();
        }
        imageThumbnail = imageElement; // Verwenden des aktuellen Bildes als Thumbnail
        imageThumbnail.style('max-width', '100px'); // Thumbnail-Größe anpassen
        imageThumbnail.style('height', 'auto'); // Erhalt des Seitenverhältnisses
        imageThumbnail.parent('imageSection'); // Thumbnail zum Ergebnisbereich hinzufügen
        imageThumbnail.show();

        lastResult = { src: imageElement.elt.src, label: label, confidence: confidence };
        const resultContainer = select('#resultContainer');
        resultContainer.html(generateResultTable(label, confidence));

        select('#interactionButtons').style('display', 'block'); // Zeige Interaktionsbuttons
    }
}

function generateResultTable(label, confidence) {
    return `
        <table>
            <tr>
                <td><img src="${lastResult.src}" style="max-width: 100px; height: auto;"></td>
                <td>
                    <div>${label}</div>
                    <div class="custom-bar">
                        <div class="confidence-bar" style="width:${confidence * 4}px;"></div>
                        <div class="confidence-text">${Math.round(confidence)}%</div>
                    </div>
                </td>
            </tr>
        </table>
    `;
}

function markCorrect() {
    if (correctClassifications.length >= 3) correctClassifications.shift();
    correctClassifications.push(lastResult);
    saveClassifiedCases();
    updateClassificationsDisplay();
}

function markIncorrect() {
    if (incorrectClassifications.length >= 3) incorrectClassifications.shift();
    incorrectClassifications.push(lastResult);
    saveClassifiedCases();
    updateClassificationsDisplay();
}

function saveClassifiedCases() {
    localStorage.setItem('correctClassifications', JSON.stringify(correctClassifications));
    localStorage.setItem('incorrectClassifications', JSON.stringify(incorrectClassifications));
}

function loadClassifiedCases() {
    correctClassifications = JSON.parse(localStorage.getItem('correctClassifications')) || [];
    incorrectClassifications = JSON.parse(localStorage.getItem('incorrectClassifications')) || [];
    updateClassificationsDisplay();
}

function updateClassificationsDisplay() {
    updateClassificationTable('#classifiedCorrectly', correctClassifications);
    updateClassificationTable('#classifiedIncorrectly', incorrectClassifications);
}

function updateClassificationTable(selector, classifications) {
    const section = select(selector);
    section.html('<h2>' + (selector.includes('Correct') ? 'Richtig' : 'Falsch') + ' klassifizierte Bilder</h2>');
    classifications.forEach(result => {
        section.child(createElement('table', generateResultTable(result.label, result.confidence)).style('width', '100%'));
    });
}
