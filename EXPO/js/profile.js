const defaultData = {
firstName:"Ariana",
lastName:"Fernández",
email:"arianaabfdz@gmail.com",
address:"San Salvador, San Martín",
phone:"+503 7495 2947",
birth:"2000-11-21"

};

/* CARGAR */

function loadData(){

const user =
JSON.parse(localStorage.getItem("userProfile"))
|| defaultData;

firstName.value=user.firstName;
lastName.value=user.lastName;
email.value=user.email;
address.value=user.address;
phone.value=user.phone;
birth.value=user.birth;

displayName.textContent=
user.firstName + " " + user.lastName;

}

/* GUARDAR */

function saveData(){

const user={

firstName:firstName.value,
lastName:lastName.value,
email:email.value,
address:address.value,
phone:phone.value,
birth:birth.value

};

localStorage.setItem(
"userProfile",
JSON.stringify(user)
);

displayName.textContent =
user.firstName + " " + user.lastName;

alert("Cambios guardados correctamente");

}

/* RESETEAR */

function resetData(){

localStorage.removeItem("userProfile");
loadData();

alert("Datos restaurados");

}

/* FOTO */

imageUpload.addEventListener("change",function(){

const file=this.files[0];

if(file){

const reader=new FileReader();

reader.onload=function(e){

previewImage.src=e.target.result;

localStorage.setItem(
"profileImage",
e.target.result
);

}

reader.readAsDataURL(file);

}

});

window.onload=()=>{

loadData();

const savedImage=
localStorage.getItem("profileImage");

if(savedImage){

previewImage.src=savedImage;

}

};