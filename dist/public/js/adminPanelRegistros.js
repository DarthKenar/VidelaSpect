
let modal = document.getElementById("my_modal_3");
let img = document.getElementById("registroFoto");
let html = document.getElementById("html");
const getImage = function(id) {
    fetch(`/admin/panel/registros/foto/${id}`)
        .then(response => {
            let contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("image")) {
                return response.blob();
            } else {
                return response.text();
            }
        })
        .then(data => {
            if (data instanceof Blob) {
                // Manejar la imagen
                let objectURL = URL.createObjectURL(data);
                img.src = objectURL;
                modal.showModal();
            } else {
                html.innerHTML = data;
                modal = document.getElementById("my_modal_3");
                img = document.getElementById("registroFoto");
            }
        })
        .catch((err) => {
            console.error(err);
        });
    
}

const changeInput = function() {
    input = document.getElementById("input");
    select = document.getElementById("select");
    //Si el valor del select es date muestra un input tipo date
    //Si el valor del select es time muestra un input tipo time
    if (select.value == "date") {
        input.type = "date";
        input.setAttribute("hx-trigger", "change");
    }else if (select.value == "time") {
        input.type = "time";
        input.setAttribute("hx-trigger", "change");
    }else {
        input.type = "text";
        input.value = "";
        input.setAttribute("hx-trigger", "keyup changed delay:300ms");
    }
    htmx.process(input);
}