function enableButton(target){
    console.log("enableButton")
    var downloadOrSendBtn = document.getElementById("loadingBtn")
    downloadOrSendBtn.outerHTML = `<a hx-get="/admin/panel/${target}/excel" hx-trigger="click" hx-target="#search_results" hx-include="[name='select'], [name='input'], [name='email']" class="btn btn-outline btn-primary btn-sm" title="Descargar/Enviar Excel de ${target}" id="downloadOrSendBtn" hx-on::before-request="disabledButton()" hx-on::after-request="enableButton('${target}')">SOLICITAR</a>`
    htmx.process(document.getElementById('downloadOrSendBtn'));
}

function disabledButton(){
    console.log("disabledButton")
    var downloadOrSendBtn = document.getElementById('downloadOrSendBtn')
    downloadOrSendBtn.outerHTML = '<button class="btn btn-sm" id="loadingBtn"><span class="loading loading-spinner"></span>Espere</button>'
}

