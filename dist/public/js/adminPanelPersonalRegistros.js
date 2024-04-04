
function enableButton(){
    let downloadOrSendBtn = document.getElementById("loadingBtn")
    downloadOrSendBtn.outerHTML = `<a hx-get="/admin/panel/personal/excel" hx-trigger="click" hx-target="#search_results" hx-include="[name='select'], [name='input'], [name='email']" class="btn btn-outline btn-primary btn-sm" title="Descargar/Enviar Excel de Personal" id="downloadOrSendBtn" onclick="disabledButton()">SOLICITAR</a>`
}
enableButton()
function disabledButton(){
    let downloadOrSendBtn = document.getElementById('downloadOrSendBtn')
    downloadOrSendBtn.outerHTML = '<button class="btn" id="loadingBtn"><span class="loading loading-spinner"></span>Espere</button>'
}

