
function actualizarSubtotal(input) {
    // Obtiene la cantidad ingresada en el campo de cantidad
    const cantidad = parseFloat(input.value) || 0;

    // Obtiene el precio desde el atributo data-precio
    const precio = parseFloat(input.getAttribute('data-precio')) || 0;

    // Calcula el subtotal multiplicando la cantidad por el precio
    const subtotal = cantidad * precio;

    // Actualiza el texto del span con el subtotal
    const subtotalElement = input.closest('.articulo').querySelector('.subtotal');
    subtotalElement.textContent = subtotal.toFixed(2);

    // Actualiza el total general
    actualizarTotal();
}

function actualizarTotal() {
    // Obtiene todos los elementos de subtotales
    const subtotales = document.querySelectorAll('.subtotal');

    // Suma todos los subtotales
    let total = 0;
    subtotales.forEach(function(subtotalElement) {
        total += parseFloat(subtotalElement.textContent) || 0;
    });

    // Actualiza el elemento de total con el valor calculado
    document.getElementById('total').textContent = total.toFixed(2);
}

// Llamar a actualizarTotal al cargar la página por primera vez para mostrar el total inicial
document.addEventListener("DOMContentLoaded", actualizarTotal);

function eliminarProducto(icono) {
    const idProducto = icono.getAttribute("data-id");
    
    // Redirigir a la URL de eliminación
    fetch(`/carrito/${idProducto}`, {
        method: "POST",
    })
    .then(response => {
        if (response.ok) {
            console.log("Producto eliminado del carrito");
            // Aquí podrías actualizar la vista del carrito o redirigir
            window.location.reload(); // Recargar la página para ver el carrito actualizado
        } else {
            console.error("Error al eliminar producto del carrito");
        }
    })
    .catch(error => console.error("Error en la solicitud:", error));
}

function comprar() {
    
}


