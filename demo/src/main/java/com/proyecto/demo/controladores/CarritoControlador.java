package com.proyecto.demo.controladores;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.servicios.ProductoServicio;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/carrito")
public class CarritoControlador {

    @Autowired
    private ProductoServicio productoServicio;

    @GetMapping()
    public String carrito(HttpSession session, ModelMap modelo) {
        // Obtener la lista de IDs del carrito de la sesión
        List<String> carrito = (List<String>) session.getAttribute("carrito");

        // Verificar si el carrito está vacío o no existe
        if (carrito == null || carrito.isEmpty()) {
            modelo.addAttribute("productos", new ArrayList<>()); // Carrito vacío
            return "carrito.html";
        }

        // Obtener los productos asociados a los IDs del carrito
        List<Producto> productos = productoServicio.obtenerProductosPorIds(carrito);

        int nroProdutosEnCarrito = productos.size();
        modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        modelo.addAttribute("productos", productos);

        return "carrito.html"; // Devolver la vista del carrito
    }

    @PostMapping("{id}")
    public String carritoEliminarProducto(@PathVariable String id, HttpSession session, ModelMap modelo) {
        List<String> carrito = (List<String>) session.getAttribute("carrito");
        carrito.remove(id);
        if (carrito == null || carrito.isEmpty()) {
            return "carrito.html";
        } else {
            List<Producto> productos = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productos.size();
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
            modelo.addAttribute("productos", productos);
            return "carrito.html";
        }
    }

    @GetMapping("/agregarAlCarrito/{id}")
    public ResponseEntity<Void> agregarAlCarrito(@PathVariable String id, HttpSession session) {
        // Obtener el carrito de la sesión
        List<String> carrito = (List<String>) session.getAttribute("carrito");

        if (carrito == null) {
            carrito = new ArrayList<>();
        }

        // Agregar el producto al carrito
        if (!carrito.contains(id)) {
            carrito.add(id);
        }

        // Guardar el carrito actualizado en la sesión
        session.setAttribute("carrito", carrito);

        // Devolver una respuesta vacía con estado HTTP 200 (OK)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/vaciarCarrito")
    public String vaciarCarrito(HttpSession session, ModelMap modelo) {
        session.setAttribute("carrito", new ArrayList<>()); // Vaciar el carrito
        modelo.addAttribute("mensaje", "Muchas gracias por tu compra");
        modelo.addAttribute("nroProdutosEnCarrito", 0); // Actualizar el contador
        modelo.addAttribute("productos", new ArrayList<>()); // Lista de productos vacía
        return "carrito.html"; // Devolver la vista del carrito
    }

}
