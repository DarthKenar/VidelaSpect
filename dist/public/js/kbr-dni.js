let teclado = document.getElementById('teclado');
let dniLabel = document.getElementById('dni');

teclado.addEventListener('click', function(event) {
    let numero = event.target.id;
    dniLabel.value = `${dniLabel.value}${numero}`
});

