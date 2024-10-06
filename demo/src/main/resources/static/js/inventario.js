// Inicializa el Set vacío
const productosEnCarrito = new Set();

// Selecciona todos los <li> que contienen los IDs de productos
const listaProductos = document.querySelectorAll('#lista-productos li');

// Itera sobre los elementos de la lista y agrega sus IDs al Set
listaProductos.forEach(li => {
    const idProducto = li.textContent; // Obtiene el texto dentro de cada <li> (el ID del producto)
    productosEnCarrito.add(idProducto); // Agrega el ID al Set
});


function agregarAlCarrito(button) {

    const idProducto = button.getAttribute("data-id");

    // Verificamos si el producto ya está en el carrito
    if (productosEnCarrito.has(idProducto)) {
        mostrarMensaje2();
        return; 
    }

    // Agregar el id del producto al Set
    productosEnCarrito.add(idProducto);

    fetch(`/carrito/agregarAlCarrito/${idProducto}`, {
        method: "GET",
    })
    .then(response => {
        if (response.ok) {
            console.log("Producto agregado al carrito");
            actualizarContador();
            mostrarMensaje();
        } else {
            console.error("Error al agregar producto al carrito");
        }
    })
    .catch(error => console.error("Error en la solicitud:", error));
}

function actualizarContador() {
    const contador = document.querySelector('.carrito-numero');
    let cantidadActual = parseInt(contador.textContent) || 0; // Obtener cantidad actual o 0
    contador.textContent = cantidadActual + 1; // Incrementar en 1
}

function mostrarMensaje() {
    const mensaje = document.getElementById('mensajeCarrito');
    mensaje.style.display = 'block';
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 2500); // Ocultar el mensaje después de 2.5 segundos
}

function mostrarMensaje2() {
    const mensaje = document.getElementById('mensajeCarrito2');
    mensaje.style.display = 'block';
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 2500); // Ocultar el mensaje después de 2.5 segundos
}