document.getElementById('archivo').addEventListener('change', function() {
    document.getElementById('miFormulario').submit();
});

document.querySelector('.bi-feather').addEventListener('click', function() {
    const input = document.querySelector('#nombre');
    const boton = document.querySelector('#botonNombre');
    if (input.style.display === 'none' || input.style.display === '') {
        input.style.display = 'block';
        boton.style.display = 'block';
    } else {
        input.style.display = 'none';
        boton.style.display = 'none';
    }
});

document.querySelector('.editDomicilio').addEventListener('click', function() {
    const input = document.querySelector('#domicilio');
    const boton = document.querySelector('#botonDomicilio');
    if (input.style.display === 'none' || input.style.display === '') {
        input.style.display = 'block';
        boton.style.display = 'block';
    } else {
        input.style.display = 'none';
        boton.style.display = 'none';
    }
});

document.querySelector('.editEmail').addEventListener('click', function() {
    const input = document.querySelector('#email');
    const boton = document.querySelector('#botonEmail');
    if (input.style.display === 'none' || input.style.display === '') {
        input.style.display = 'block';
        boton.style.display = 'block';
    } else {
        input.style.display = 'none';
        boton.style.display = 'none';
    }
});
