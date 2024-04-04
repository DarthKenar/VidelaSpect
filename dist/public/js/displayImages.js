let images = document.getElementsByClassName('image');
let imageName = document.getElementById('imageName');

let selected = null

function selectImage(name){
    for(let i = 0; i < images.length; i++){
        images[i].classList.remove('imageSelected');
    }
    let number = name.match(/\d+/g);
    let image = images[number];
    image.classList.add('imageSelected');
    imageName.setAttribute("value",`${name}`)
}



