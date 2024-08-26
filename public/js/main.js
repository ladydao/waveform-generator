document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDuration = document.getElementById('fileDuration');
    const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const audioPlayer = document.getElementById('audioPlayer');
    const generateBtn = document.getElementById('generateBtn');
    const status = document.getElementById('status');
    const result = document.getElementById('result');
    const resultImage = document.getElementById('resultImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const error = document.getElementById('error');

    let selectedFile = null;

    dropZone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => handleFile(e.target.files[0]);
        input.click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500');
        handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (file && file.type.startsWith('audio/')) {
            selectedFile = file;
            displayFileInfo(file);
            setupAudioPlayer(file);
        } else {
            alert('Please select a valid audio file.');
        }
    }

    function displayFileInfo(file) {
        fileName.textContent = `File Name: ${file.name}`;
        fileSize.textContent = `File Size: ${formatFileSize(file.size)}`;
        fileInfo.classList.remove('hidden');

        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
            fileDuration.textContent = `Duration: ${formatDuration(audio.duration)}`;
        };
    }

    function setupAudioPlayer(file) {
        const audioUrl = URL.createObjectURL(file);
        audioPlayer.src = audioUrl;
        audioPlayerContainer.classList.remove('hidden');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    generateBtn.addEventListener('click', () => {
        if (!selectedFile) {
            alert('Please select an audio file first.');
            return;
        }

        const visualizationType = document.querySelector('input[name="visualizationType"]:checked').value;
        generateVisualization(selectedFile, visualizationType);
    });

    function generateVisualization(file, type) {
        const formData = new FormData();
        formData.append('audio', file);

        status.classList.remove('hidden');
        result.classList.add('hidden');
        error.classList.add('hidden');

        fetch(`/generate-${type}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error generating visualization');
            }
            return response.blob();
        })
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            resultImage.src = imageUrl;
            downloadBtn.href = imageUrl;
            result.classList.remove('hidden');
            status.classList.add('hidden');
        })
        .catch(err => {
            error.textContent = err.message;
            error.classList.remove('hidden');
            status.classList.add('hidden');
        });
    }
});