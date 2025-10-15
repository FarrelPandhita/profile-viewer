// State
var isRunning = false;
var stats = {
    totalVisits: 0,
    currentVisit: 0,
    successfulVisits: 0,
    failedVisits: 0
};

var userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
];

// DOM Elements
var toggleAdvanced = document.getElementById('toggleAdvanced');
var advancedSettings = document.getElementById('advancedSettings');
var startBtn = document.getElementById('startBtn');
var stopBtn = document.getElementById('stopBtn');
var logsContainer = document.getElementById('logsContainer');
var progressText = document.getElementById('progressText');
var progressBar = document.getElementById('progressBar');
var successCount = document.getElementById('successCount');
var failCount = document.getElementById('failCount');
var runningStatus = document.getElementById('runningStatus');

// Toggle Advanced Settings
toggleAdvanced.addEventListener('click', function() {
    advancedSettings.classList.toggle('show');
    if (advancedSettings.classList.contains('show')) {
        toggleAdvanced.textContent = 'Hide Advanced';
    } else {
        toggleAdvanced.textContent = 'Show Advanced';
    }
});

// Add Log
function addLog(message, type) {
    if (!type) type = 'info';
    
    var now = new Date();
    var time = now.toLocaleTimeString();
    
    if (logsContainer.querySelector('.log-empty')) {
        logsContainer.innerHTML = '';
    }

    var logEntry = document.createElement('div');
    logEntry.className = 'log-entry log-' + type;
    logEntry.innerHTML = '<span class="log-time">[' + time + ']</span> ' + message;
    
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);

    // Keep only last 100 logs
    while (logsContainer.children.length > 100) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

// Update Stats Display
function updateStats() {
    progressText.textContent = stats.currentVisit + ' / ' + stats.totalVisits;
    var progress = stats.totalVisits > 0 ? (stats.currentVisit / stats.totalVisits) * 100 : 0;
    progressBar.style.width = progress + '%';
    successCount.textContent = stats.successfulVisits;
    failCount.textContent = stats.failedVisits;
}

// Simulate Visit
function simulateVisit(visitNum) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            var success = Math.random() > 0.05; // 95% success rate
            var status = success ? 200 : (Math.random() > 0.5 ? 404 : 500);
            var ua = userAgents[Math.floor(Math.random() * userAgents.length)];
            
            var message = 'Visit #' + visitNum + ' - Status: ' + status + ' - UA: ' + ua.substring(0, 50) + '...';
            addLog(message, success ? 'success' : 'error');
            
            resolve({ success: success, status: status });
        }, Math.random() * 1000 + 500);
    });
}

// Sleep Function
function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// Start Visits
async function startVisits() {
    var url = document.getElementById('url').value;
    var visitCount = parseInt(document.getElementById('visitCount').value);
    var minView = parseFloat(document.getElementById('minView').value);
    var maxView = parseFloat(document.getElementById('maxView').value);
    var minDelay = parseFloat(document.getElementById('minDelay').value);
    var maxDelay = parseFloat(document.getElementById('maxDelay').value);

    if (!url || !url.startsWith('http')) {
        addLog('Invalid URL! Must start with http:// or https://', 'error');
        return;
    }

    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    runningStatus.style.display = 'flex';

    // Disable inputs
    var inputs = document.querySelectorAll('.form-input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    stats = {
        totalVisits: visitCount,
        currentVisit: 0,
        successfulVisits: 0,
        failedVisits: 0
    };
    updateStats();

    addLog('Starting ' + visitCount + ' visits to ' + url, 'info');

    for (var i = 1; i <= visitCount; i++) {
        if (!isRunning) {
            addLog('Stopped by user', 'warning');
            break;
        }

        stats.currentVisit = i;
        updateStats();

        var result = await simulateVisit(i);

        if (result.success) {
            stats.successfulVisits++;
        } else {
            stats.failedVisits++;
        }
        updateStats();

        // Simulate view time
        var viewTime = Math.random() * (maxView - minView) + minView;
        await sleep(viewTime * 1000);

        // Inter-visit delay
        var interDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        await sleep(interDelay * 1000);
    }

    if (isRunning) {
        addLog('All visits completed!', 'success');
    }

    stopVisits();
}

// Stop Visits
function stopVisits() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    runningStatus.style.display = 'none';

    // Enable inputs
    var inputs = document.querySelectorAll('.form-input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }

    if (stats.currentVisit < stats.totalVisits && stats.currentVisit > 0) {
        addLog('Stopping...', 'warning');
    }
}

// Event Listeners
startBtn.addEventListener('click', startVisits);
stopBtn.addEventListener('click', function() {
    isRunning = false;
});
