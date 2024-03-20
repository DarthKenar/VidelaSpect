let teclado = document.getElementById('teclado');
let dniLabel = document.getElementById('dni');

teclado.addEventListener('click', function(event) {
    let numero = event.target.id;
    if(!isNaN(numero)){
        dniLabel.value = `${dniLabel.value}${numero}`
    }
});

