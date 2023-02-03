/* Stockfish Settings ----------*/
depthValue.innerHTML = depthRangeSlider.value;
depthMaxDisplay.innerHTML = '/' + depthRangeSlider.max

memoryValue.innerHTML = memoryRangeSlider.value;
memoryMaxDisplay.innerHTML = '/' + memoryRangeSlider.max + 'MB'

cpuValue.innerHTML = cpuRangeSlider.value;
cpuMaxDisplay.innerHTML = '/' + cpuRangeSlider.max

/* End Stockfish Settings ----------*/

/* Open Overlay -----*/

notationOptions.addEventListener("click", function () {
    overlaySettingsContainer.classList.remove('REMOVE')
    importExportGame.classList.remove('REMOVE')
    body.style.overflowY = "hidden";
});


stockfishOptions.addEventListener("click", function () {
    overlaySettingsContainer.classList.remove('REMOVE')
    stockfishSettings.classList.remove('REMOVE')
    body.style.overflowY = "hidden"
});

overlayButton.addEventListener("click", function () {
    overlaySettingsContainer.classList.add('REMOVE')
    stockfishSettings.classList.add('REMOVE')
    importExportGame.classList.add('REMOVE')
    body.style.overflowY = ""
});
