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

function getMonthString(month) {
    let monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[month];
}

window.onload = function() {
    setInterval(function() {
        let fecha = new Date();
        document.getElementById('dia').innerText = fecha.getDate()
        document.getElementById('mes').innerText = getMonthString(fecha.getMonth()) //aqui debería llamar a la funcion que me devuelve el string
        document.getElementById('hora').style.setProperty('--value', fecha.getHours());
        document.getElementById('minutos').style.setProperty('--value', fecha.getMinutes());
        document.getElementById('segundos').style.setProperty('--value', fecha.getSeconds());
    }, 1000);
};