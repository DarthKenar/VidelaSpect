"use strict";

//capturar video ó imagen
const video = document.querySelector(".video");
const canvas = document.querySelector(".canvas");

//tomar foto
const btnFoto = document.querySelector(".start-btn");

//mostrar foto
const photo = document.querySelector(".photo");

//enviar datos de foto
const btnEnviar = document.querySelector("#enviar");

//constrains
/*
Aquí enviamos las caracteristicas del video y
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

//3. -----------> si la promesa tiene exito
const handleSucces = (stream) => {
  video.srcObject = stream;
  video.play();
};

//4.------------>Llamada a la función get
getVideo();

//4. ----------> Button y foto
btnFoto.addEventListener("click", () => {
  let context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 640, 360);
  let data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
});

btnEnviar.addEventListener("click", async ()=>{
  // Convertir dataURL a Blob
  let response = await fetch(data);
  let blob = await response.blob();

  // Enviar Blob a un servidor
  let formData = new FormData();
  formData.append("image", blob, "image.png");

  fetch("https://tu-servidor.com/subir-imagen", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
});