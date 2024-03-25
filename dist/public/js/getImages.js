
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