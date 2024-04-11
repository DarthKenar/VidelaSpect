var autoPanelBtn = document.getElementById('autoPanelBtn');
var manualPanelBtn = document.getElementById('manualPanelBtn');
var autoPanel = document.getElementById('autoPanel');
var manualPanel = document.getElementById('manualPanel');
function showAutoPanel() {
    manualPanelBtn.classList.remove('active', 'text-primary');
    autoPanelBtn.classList.add('active','text-primary');
    manualPanel.classList.add("vanish-linear")
    setTimeout(() => {
        manualPanel.classList.remove("vanish-linear", "appear-linear")
        manualPanel.classList.add("hidden")
        autoPanel.classList.remove("hidden")
        autoPanel.classList.add("appear-linear")
        setTimeout(() => {
            autoPanel.classList.remove("appear-linear")
        }, 300);
    }, 300);
}
function showManualPanel() {
    autoPanelBtn.classList.remove('active', 'text-primary');
    manualPanelBtn.classList.add('active','text-primary');
    autoPanel.classList.add("vanish-linear")
    setTimeout(() => {
        autoPanel.classList.remove("vanish-linear", "appear-linear")
        autoPanel.classList.add("hidden")
        manualPanel.classList.remove("hidden")
        manualPanel.classList.add("appear-linear")
        setTimeout(() => {
            manualPanel.classList.remove("appear-linear")
        }, 300);
    }, 300);
}