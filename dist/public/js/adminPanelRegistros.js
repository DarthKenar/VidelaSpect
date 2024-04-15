
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
    let name = document.getElementById("name");
    let select = document.getElementById("select");
    let timeGroup = document.getElementById("timeGroup");
    let dateGroup = document.getElementById("dateGroup");
    let getDataTimeBtn = document.getElementById("getDataTimeBtn");
    let fromTime = document.getElementById("fromTime");
    let toTime = document.getElementById("toTime");
    let fromDate = document.getElementById("fromDate");
    let toDate = document.getElementById("toDate");
    if (select.value == "personal_name") {
        timeGroup.classList.add("hidden");
        dateGroup.classList.add("hidden");
        getDataTimeBtn.classList.add("hidden");
        name.classList.remove("hidden");
    }else if (select.value == "time") {
        timeGroup.classList.remove("hidden");
        dateGroup.classList.add("hidden");
        getDataTimeBtn.classList.remove("hidden");
        name.classList.add("hidden");
        fromDate.value = undefined;
        toDate.value = undefined;
    }else if (select.value == "date") {
        timeGroup.classList.add("hidden");
        dateGroup.classList.remove("hidden");
        getDataTimeBtn.classList.remove("hidden");
        name.classList.add("hidden");
        fromTime.value = undefined;
        toTime.value = undefined;
    }
}