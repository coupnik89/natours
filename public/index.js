import '@babel/polyfill';
import { login } from './js/login';
import { updateData } from './js/updateData'
import { displayMap } from './js/mapbox';
import { renderSpinner } from './js/spinner'

// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const updateDataForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-password')

const formPasswordInnerHtml = document.querySelector('.form-user-password')
const formDataInnerHtml = document.querySelector('.form-user-data')
const parentContainer = document.querySelector('.renderSpinner')

// DELEGATION
if (mapBox) {
    const locations = JSON.parse(document.getElementById('map').dataset.locations)
    displayMap(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if (updateDataForm) {
    updateDataForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        renderSpinner(formDataInnerHtml)

        const form = new FormData()

        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        // Files are an array: Theres only one in the array
        form.append('photo', document.getElementById('photo').files[0])

        console.log(form)

        await updateData(form, 'data')

        parentContainer.innerHTML = ''
        formDataInnerHtml.style.display = 'block'
    })
}

if(updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        renderSpinner(formPasswordInnerHtml)

        const passwordCurrent = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        
        await updateData({passwordCurrent, password, passwordConfirm}, 'password')

        parentContainer.innerHTML = ''
        formPasswordInnerHtml.style.display = 'block'

        document.getElementById('password-current').value = document.getElementById('password').value = document.getElementById('password-confirm').value = ''
    })
}