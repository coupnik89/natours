export const renderSpinner = (form) => {
    const parentContainer = document.querySelector('.renderSpinner')
    
    const markup = `
            <div class="spinner">
                <svg>
                    <use xlink:href="/img/icons.svg#icon-loader"></use>
                </svg>
            </div>
        `
    
    form.style.display = 'none'
    parentContainer.insertAdjacentHTML('afterbegin', markup)
}