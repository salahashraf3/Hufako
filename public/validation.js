const name = document.getElementById('name');
const email = document.getElementById('email');
const number = document.getElementById("number")
const password = document.getElementById('password');
const form = document.getElementById('form');

//error Message
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const numberError = document.getElementById('numberError')

form.addEventListener('submit', (e) =>{

    //Name Validation
   if(name.value === '' || name.value === null){
    nameError.innerHTML = 'Name is required';
    e.preventDefault();
   }

   //Email Validation
   if(email.value === '' || email.value === null ){
    emailError.innerHTML = 'Email is required';  
    e.preventDefault();
   }
   

   //Password Validation
   if(password.value === '' || password.value === null){
    passwordError.innerHTML = 'Password is required';
    e.preventDefault();
   }
   if(password.length < 5 ){
    passwordError.innerHTML = 'Password must be at least 5 characters long';
    e.preventDefault();
   }

   //Number Validation
   if(number.value === '' || number.value === null || number.value < 10){
    numberError.innerHTML = 'Number must be at least 10';
    e.preventDefault();
   }
})