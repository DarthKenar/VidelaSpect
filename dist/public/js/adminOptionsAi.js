// Obtén los elementos del DOM
var rangeInput = document.getElementById('accuracy');
var rangeValue = document.getElementById('accuracyValue');

// Función para actualizar el valor
function updateValue() {
    rangeValue.style.setProperty('--value', rangeInput.value);
}

// Escucha el evento 'input' en el rango
rangeInput.addEventListener('input', updateValue);

// Actualiza el valor inicial
updateValue();