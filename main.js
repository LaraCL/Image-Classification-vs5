let classifier;
let imageElement;
let imageThumbnail; // Thumbnail des aktuellen Bildes
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
        imageThumbnail.style('max-width', '400px');
        imageThumbnail.style('height', 'auto');
        imageThumbnail.show();
    } else {
        console.log('Nicht unterstützter Dateityp');
    }
}

function classifyImage() {
    if (imageThumbnail) {
        classifier.classify(imageThumbnail, gotResult);
        imageThumbnail.hide();
    }
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
    } else {
        const confidence = results[0].confidence * 100;
        const label = results[0].label;

        // Prepare and display the result in the results section
        const resultContainer = select('#resultContainer');
        resultContainer.html(`
            <img src="${imageThumbnail.elt.src}" style="max-width: 100px; height: auto;">
            <div>${label} - ${Math.round(confidence)}%</div>
            <div class="custom-bar">
                <div class="confidence-bar" style="width:${confidence * 4}px;"></div>
                <div class="confidence-text">${Math.round(confidence)}%</div>
            </div>
        `);

        select('#interactionButtons').style('display', 'block');
        imageThumbnail = null;
    }
}

function markCorrect() {
    if (correctClassifications.length >= 3) correctClassifications.shift();
    correctClassifications.push(imageThumbnail);
    updateClassificationsDisplay();
}

function markIncorrect() {
    if (incorrectClassifications.length >= 3) incorrectClassifications.shift();
    incorrectClassifications.push(imageThumbnail);
    updateClassificationsDisplay();
}

function updateClassificationsDisplay() {
    updateClassificationList('#classifiedCorrectly', correctClassifications);
    updateClassificationList('#classifiedIncorrectly', incorrectClassifications);
}

function updateClassificationList(selector, list) {
    const container = select(selector);
    container.html('<h2>' + (selector.includes('Correct') ? 'Richtig' : 'Falsch') + ' klassifizierte Bilder</h2>');
    list.forEach(img => {
        const entry = createElement('div');
        entry.html(`
            <img src="${img.elt.src}" style="max-width: 100px; height: auto;">
            <div>${img.label} - ${Math.round(img.confidence)}%</div>
        `);
        container.child(entry);
    });
}
