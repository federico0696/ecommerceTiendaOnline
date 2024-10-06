package com.proyecto.demo.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.servicios.ProductoServicio;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/buscador")
public class BuscadorControlador {

    @Autowired
    private ProductoServicio productoServicio;

    @GetMapping("/{nombre}")
    public String buscarProductoPorNombre(@RequestParam(required = false) String nombre, HttpSession session, ModelMap modelo) {
        List<Producto> productos = productoServicio.buscarProductoPorNombre(nombre);
        modelo.addAttribute("productos", productos);

        List<String> carrito = (List<String>) session.getAttribute("carrito");
        if (carrito != null && !carrito.isEmpty()) {
            List<Producto> productosEnCarrito = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productosEnCarrito.size();
            modelo.addAttribute("productosEnCarrito", carrito);
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        }
        return "buscador.html";
    }

}
