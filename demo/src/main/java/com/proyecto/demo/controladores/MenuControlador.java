package com.proyecto.demo.controladores;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.entidades.Usuario;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.servicios.ProductoServicio;
import com.proyecto.demo.servicios.UsuarioServicio;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/")
public class MenuControlador {

    @Autowired
    private ProductoServicio productoServicio;

    @Autowired
    private UsuarioServicio usuarioServicio;

    @GetMapping("/")
    public String menu(HttpSession session, ModelMap modelo) {
        String temporada = "VERANO";
        List<Producto> productosTemporada = productoServicio.obtenerProductosPorTemporada(temporada);
        modelo.addAttribute("productosTemporada", productosTemporada);
        List<Producto> productos = productoServicio.obtenerProductosPorNovedad();
        modelo.addAttribute("productos", productos);

        List<String> carrito = (List<String>) session.getAttribute("carrito");
        if (carrito != null && !carrito.isEmpty()) {
            List<Producto> productosEnCarrito = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productosEnCarrito.size();
            modelo.addAttribute("productosEnCarrito", carrito);
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        }
        return "menu.html";
    }

    @PostMapping("/")
    public String menuPersonalizado(HttpSession session, String temporada, ModelMap modelo) {
        List<Producto> productosTemporada = productoServicio.obtenerProductosPorTemporada(temporada);
        modelo.addAttribute("productosTemporada", productosTemporada);
        List<Producto> productos = productoServicio.obtenerProductosPorNovedad();
        modelo.addAttribute("productos", productos);

        List<String> carrito = (List<String>) session.getAttribute("carrito");
        if (carrito != null && !carrito.isEmpty()) {
            List<Producto> productosEnCarrito = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productosEnCarrito.size();
            modelo.addAttribute("productosEnCarrito", carrito);
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        }
        return "menu.html";
    }

    @GetMapping("/registrar")
    public String registrar() {
        return "registro.html";
    }

    @PostMapping("/registro")
    public String registro(@RequestParam("nombre") String nombre, @RequestParam("email") String email,
            @RequestParam("password") String password, @RequestParam("password2") String password2, ModelMap modelo,
            @RequestParam(required = false) MultipartFile imagen) {

        try {

            usuarioServicio.registrar(imagen, nombre, email, password, password2);
            modelo.put("exito", "Usuario registrado correctamente");
            String temporada = "VERANO";
            List<Producto> productosTemporada = productoServicio.obtenerProductosPorTemporada(temporada);
            modelo.addAttribute("productosTemporada", productosTemporada);
            List<Producto> productos = productoServicio.obtenerProductosPorNovedad();
            modelo.addAttribute("productos", productos);
            return "login.html";

        } catch (MiException ex) {
            modelo.put("error", ex.getMessage());
            modelo.put("nombre", nombre);
            modelo.put("email", email);
            return "registro.html";
        }

    }

    @GetMapping("/login")
    public String login(@RequestParam(required = false) String error, ModelMap modelo) {
        if (error != null) {
            modelo.put("error", "Usuario o Contraseña inválidos!");
        }
        return "login.html";
    }

    @GetMapping("/inventario")
    public String sesionInventario(HttpSession session, ModelMap modelo) {
        List<Producto> productos = productoServicio.listarProductos();
        modelo.addAttribute("productos", productos);

        List<String> carrito = (List<String>) session.getAttribute("carrito");
        if (carrito != null && !carrito.isEmpty()) {
            List<Producto> productosEnCarrito = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productosEnCarrito.size();
            modelo.addAttribute("productosEnCarrito", carrito);
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        }
        return "inventario.html";
    }

    @GetMapping("/inventarioCategorizado/{categoria}")
    public String sesionZapatillas(HttpSession session, ModelMap modelo, @PathVariable String categoria) {
        List<Producto> productos = productoServicio.obtenerProductosPorCategoria(categoria);
        modelo.addAttribute("productos", productos);

        List<String> carrito = (List<String>) session.getAttribute("carrito");
        if (carrito != null && !carrito.isEmpty()) {
            List<Producto> productosEnCarrito = productoServicio.obtenerProductosPorIds(carrito);
            int nroProdutosEnCarrito = productosEnCarrito.size();
            modelo.addAttribute("productosEnCarrito", carrito);
            modelo.addAttribute("nroProdutosEnCarrito", nroProdutosEnCarrito);
        }
        modelo.addAttribute("categoria", categoria);
        return "inventarioCategorizado.html";
    }

}
