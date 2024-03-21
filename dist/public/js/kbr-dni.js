let teclado = document.getElementById('teclado');
let dniLabel = document.getElementById('dni');

teclado.addEventListener('click', function(event) {
    let numero = event.target.id;
    if(!isNaN(numero)){
        dniLabel.value = `${dniLabel.value}${numero}`
    }
    if(numero === "backspace"){
        dniLabel.value = dniLabel.value.slice(0, -1);
    }
});



window.onload = function() {
    setInterval(function() {
        let fecha = new Date();
        document.getElementById('dia').style.setProperty('--value', fecha.getDate());
        document.getElementById('hora').style.setProperty('--value', fecha.getHours());
        document.getElementById('minutos').style.setProperty('--value', fecha.getMinutes());
        document.getElementById('segundos').style.setProperty('--value', fecha.getSeconds());
    }, 1000);
};