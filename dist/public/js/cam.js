"use strict";
var data;
var activador = false
//capturar video ó imagen
const video = document.querySelector(".video");
const canvas = document.querySelector(".canvas");
const personalId = document.getElementById("personalId").value

//tomar foto
const btnFoto = document.querySelector(".start-btn");

//mostrar foto
const photo = document.querySelector(".photo");

//enviar datos de foto
const btnEnviar = document.querySelector("#enviar");

//constrains
/*
Aquí enviamos las características del video y
audio que solicitamos
*/

const constraints = {
  video: { width: 640, height: 360 },
  audio: false,
};


//acceso a la webcam
/*
Aquí recibimos la respuesta del navegador, es una promesa
 */
const getVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSucces(stream);
    console.log(stream);
  } catch (error) {
    console.log(error);
  }
};

//3. -----------> si la promesa tiene éxito
const handleSucces = (stream) => {
  video.srcObject = stream;
  video.play();
};

//4.------------>Llamada a la función get
getVideo();

//4. ----------> Button y foto
btnFoto.addEventListener("click", () => {
  activador = true
  let context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 640, 360);
  data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
});

btnEnviar.addEventListener("click", async ()=>{
  if(activador){
    // Convertir dataURL a Blob
    let response = await fetch(data);
    let blob = await response.blob();

    // Enviar Blob a un servidor
    let formData = new FormData();
    formData.append("image", blob, "image.png");
    formData.append("userId",personalId)
    fetch("http://localhost:7000/personal/foto/send", {
      method: "POST",
      body: formData,
    })
    .then((response) => response.text())
    .then(text => {
      const data = JSON.parse(text);
      console.log(typeof data);
      console.log(data)
      console.log(data.url)
      window.location.href = data.url;
    })
    .catch((error) => console.error(error));
  }else{
    console.log("Todavía no se ha sacado una foto.")
  }
});
