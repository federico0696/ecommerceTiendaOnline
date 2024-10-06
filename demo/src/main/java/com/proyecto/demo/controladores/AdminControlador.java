package com.proyecto.demo.controladores;

import java.io.IOException;
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

import com.proyecto.demo.entidades.Categoria;
import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.entidades.Usuario;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.servicios.CategoriaServicio;
import com.proyecto.demo.servicios.ProductoServicio;
import com.proyecto.demo.servicios.UsuarioServicio;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminControlador {

    @Autowired
    private ProductoServicio productoServicio;

    @Autowired
    private CategoriaServicio categoriaServicio;

    @Autowired
    private UsuarioServicio usuarioServicio;

    @GetMapping("/agregarProducto")
    public String sesionAdminAgregarProducto(ModelMap modelo) {
        List<Categoria> categorias = categoriaServicio.listarCategorias();
        modelo.addAttribute("categorias", categorias);
        return "agregarProducto.html";
    }

    @PostMapping("/agregar")
    public String registro(@RequestParam(required = false) String nombre,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) Double precio,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam(required = false) String temporada,
            @RequestParam(required = false) boolean novedad,
            ModelMap modelo) throws MiException, IOException {
        try {
            productoServicio.crearProducto(nombre, descripcion, precio, categoria, temporada, novedad, imagen);
            modelo.put("exito", "El producto fue registrado correctamente");
            List<Categoria> categorias = categoriaServicio.listarCategorias();
            modelo.addAttribute("categorias", categorias);
        } catch (MiException ex) {
            List<Categoria> categorias = categoriaServicio.listarCategorias();
            modelo.addAttribute("categorias", categorias);
            modelo.put("error", ex.getMessage());

            modelo.put("nombre", nombre);
            modelo.put("descripcion", descripcion);
            modelo.put("precio", precio);
            modelo.put("categoriaSeleccionada", categoria);
            modelo.put("imagen", imagen);

            return "agregarProducto.html";
        }

        return "agregarProducto.html";
    }

    @GetMapping("/verProducto")
    public String sesionAdminVerProducto(ModelMap modelo) {
        List<Producto> productos = productoServicio.listarProductos();
        modelo.addAttribute("productos", productos);
        List<Producto> zapatillas = productoServicio.obtenerProductosPorCategoria("zapatillas");
        modelo.addAttribute("zapatillas", zapatillas);
        List<Producto> remeras = productoServicio.obtenerProductosPorCategoria("remeras");
        modelo.addAttribute("remeras", remeras);
        List<Producto> buzos = productoServicio.obtenerProductosPorCategoria("buzos");
        modelo.addAttribute("buzos", buzos);
        List<Producto> pantalones = productoServicio.obtenerProductosPorCategoria("pantalones");
        modelo.addAttribute("pantalones", pantalones);
        List<Producto> camperas = productoServicio.obtenerProductosPorCategoria("camperas");
        modelo.addAttribute("camperas", camperas);
        return "verProducto.html";
    }

    @GetMapping("/modificarProducto")
    public String sesionAdminModificarProducto(ModelMap modelo) {
        List<Producto> productos = productoServicio.listarProductos();
        modelo.addAttribute("productos", productos);
        List<Producto> zapatillas = productoServicio.obtenerProductosPorCategoria("zapatillas");
        modelo.addAttribute("zapatillas", zapatillas);
        List<Producto> remeras = productoServicio.obtenerProductosPorCategoria("remeras");
        modelo.addAttribute("remeras", remeras);
        List<Producto> buzos = productoServicio.obtenerProductosPorCategoria("buzos");
        modelo.addAttribute("buzos", buzos);
        List<Producto> pantalones = productoServicio.obtenerProductosPorCategoria("pantalones");
        modelo.addAttribute("pantalones", pantalones);
        List<Producto> camperas = productoServicio.obtenerProductosPorCategoria("camperas");
        modelo.addAttribute("camperas", camperas);
        return "modificarProducto.html";
    }

    @GetMapping("/modificar/{id}")
    public String modificar(@PathVariable String id, ModelMap modelo) {
        List<Categoria> categorias = categoriaServicio.listarCategorias();
        modelo.addAttribute("categorias", categorias);

        modelo.put("producto", productoServicio.getOne(id));
        return "adminModificar.html";
    }

    @PostMapping("/modificar/{id}")
    public String modificar(@PathVariable(required = false) String id, @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String descripcion, @RequestParam(required = false) Double precio,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String temporada,
            @RequestParam(defaultValue = "false") boolean novedad,
            @RequestParam(required = false) MultipartFile imagen, ModelMap modelo) throws MiException {
        try {
            productoServicio.modificarProducto(id, nombre, descripcion, precio, categoria, imagen, temporada, novedad);
            modelo.put("exito", "El producto fue modificado correctamente");
            List<Producto> productos = productoServicio.listarProductos();
            modelo.addAttribute("productos", productos);
            List<Producto> zapatillas = productoServicio.obtenerProductosPorCategoria("zapatillas");
            modelo.addAttribute("zapatillas", zapatillas);
            List<Producto> remeras = productoServicio.obtenerProductosPorCategoria("remeras");
            modelo.addAttribute("remeras", remeras);
            List<Producto> buzos = productoServicio.obtenerProductosPorCategoria("buzos");
            modelo.addAttribute("buzos", buzos);
            List<Producto> pantalones = productoServicio.obtenerProductosPorCategoria("pantalones");
            modelo.addAttribute("pantalones", pantalones);
            List<Producto> camperas = productoServicio.obtenerProductosPorCategoria("camperas");
            modelo.addAttribute("camperas", camperas);
        } catch (MiException ex) {
            List<Categoria> categorias = categoriaServicio.listarCategorias();
            modelo.addAttribute("categorias", categorias);
            modelo.put("error", ex.getMessage());
            modelo.put("producto", productoServicio.getOne(id));
            return "adminModificar.html";
        }

        return "modificarProducto.html";

    }

    @GetMapping("/eliminarProducto/{id}")
    public String eliminarProducto(@PathVariable String id, ModelMap modelo) {
        modelo.put("producto", productoServicio.getOne(id));

        return "adminEliminar.html";
    }

    @PostMapping("/eliminar/{id}")
    public String eliminar(@PathVariable String id, @RequestParam String respuesta, ModelMap modelo)
            throws MiException, IOException {
        if (respuesta.equals("si")) {
            productoServicio.eliminarProducto(id);
            modelo.put("mensaje", "El producto fue eliminado exitosamente.");
        } else {
            modelo.put("mensaje", "El producto no fue eliminado.");
        }
        return "redirect:../verProducto";

    }

    @GetMapping("/listaUsuarios")
    public String listaUsuarios(ModelMap modelo) {
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        modelo.addAttribute("usuarios", usuarios);
        return "listaUsuarios.html";
    }

    @GetMapping("/cambiarRolUsuario/{id}")
    public String cambiarRolUsuario(@PathVariable String id, ModelMap modelo) {
        usuarioServicio.cambiarRol(id);
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        modelo.addAttribute("usuarios", usuarios);

        return "listaUsuarios.html";
    }

    @GetMapping("/modificarUsuario/{id}")
    public String modificarUsuario(@PathVariable String id, ModelMap modelo) {

        modelo.put("usuario", usuarioServicio.getOne(id));

        return "adminModificarUsuario.html";
    }

    @PostMapping("/modificarUsuario/{id}")
    public String modificarUsuario(@PathVariable(required = false) String id,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String email, @RequestParam(required = false) String password,
            @RequestParam(required = false) String password2,
            @RequestParam(required = false) MultipartFile imagen, ModelMap modelo) throws MiException {
        try {
            usuarioServicio.actualizar(id, nombre, email, password, password2, imagen);
            modelo.put("exito", "El usuario fue modificado correctamente");
            List<Usuario> usuarios = usuarioServicio.listarUsuarios();
            modelo.addAttribute("usuarios", usuarios);
            return "listaUsuarios.html";
        } catch (MiException ex) {

            modelo.put("error", ex.getMessage());
            modelo.put("usuario", usuarioServicio.getOne(id));
            return "adminModificarUsuario.html";
        }

    }

}
