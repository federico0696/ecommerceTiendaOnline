package com.proyecto.demo.servicios;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.proyecto.demo.entidades.Categoria;
import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.enumeraciones.Temporada;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.repositorios.CategoriaRepositorio;
import com.proyecto.demo.repositorios.ProductoRepositorio;

@Service
public class ProductoServicio {

    @Autowired
    ProductoRepositorio productoRepositorio;

    @Autowired
    CategoriaRepositorio categoriaRepositorio;

    private void validar(String nombre, String descripcion, Double precio, String idCategoria)
            throws MiException {
        if (nombre == null || nombre.isEmpty()) {
            throw new MiException("El nombre no puede estar vacio");
        }
        if (descripcion == null || descripcion.isEmpty()) {
            throw new MiException("La descripcion no puede estar vacia");
        }
        if (precio == null) {
            throw new MiException("El precio no puede ser nulo");
        }
        if (idCategoria == null || idCategoria.isEmpty()) {
            throw new MiException("El id de la categoria no puede estar vacio");
        }

        Optional<Categoria> optionalCategoria = categoriaRepositorio.findById(idCategoria);
        if (!optionalCategoria.isPresent()) {
            throw new MiException("Categoria no encontrada");
        }
    }

    @Transactional
    public void crearProducto(String nombre, String descripcion, Double precio, String idCategoria, String temporada,
            boolean novedad,
            MultipartFile imagen)
            throws MiException, IOException {

        validar(nombre, descripcion, precio, idCategoria);
        Path directorioImagenes = Paths.get("src/main/resources/static/img");
        String rutaAbsoluta = directorioImagenes.toFile().getAbsolutePath();

        try {
            byte[] bytesImg = imagen.getBytes();
            Path rutaCompleta = Paths.get(rutaAbsoluta + "/" + imagen.getOriginalFilename());
            Files.write(rutaCompleta, bytesImg);
        } catch (IOException e) {
            e.printStackTrace();
        }

        Categoria categoria = categoriaRepositorio.findById(idCategoria).get();

        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setPrecio(precio);
        producto.setCategoria(categoria);
        switch (temporada) {
            case "INVIERNO":
                producto.setTemporada(Temporada.INVIERNO);
                break;

            case "VERANO":
                producto.setTemporada(Temporada.VERANO);
                break;

            case "OTOÑO":
                producto.setTemporada(Temporada.OTOÑO);
                break;

            case "PRIMAVERA":
                producto.setTemporada(Temporada.PRIMAVERA);
                break;

            default:
                break;
        }
        producto.setNovedad(novedad);
        producto.setImagen("/img/" + imagen.getOriginalFilename());

        productoRepositorio.save(producto);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarProductos() {

        return productoRepositorio.findAll();
    }

    public List<Producto> obtenerProductosPorNovedad() {

        return productoRepositorio.findByNovedad(true);
    }

    public List<Producto> obtenerProductosPorTemporada(String temporada) {
        switch (temporada) {
            case "INVIERNO":
                return productoRepositorio.findByTemporada(Temporada.INVIERNO);

            case "VERANO":
                return productoRepositorio.findByTemporada(Temporada.VERANO);

            case "OTOÑO":
                return productoRepositorio.findByTemporada(Temporada.OTOÑO);

            case "PRIMAVERA":
                return productoRepositorio.findByTemporada(Temporada.PRIMAVERA);

            default:
                break;
        }
        return null;
    }

    public List<Producto> obtenerProductosPorCategoria(String nombreCategoria) {
        return productoRepositorio.findByCategoriaNombre(nombreCategoria);
    }

    public List<Producto> buscarProductoPorNombre(String nombreProducto) {
        return productoRepositorio.buscarPorNombre(nombreProducto);
    }

    @Transactional
    public void modificarProducto(String id, String nuevoNombre, String nuevaDescripcion, Double nuevoPrecio,
            String idCategoria, MultipartFile imagen, String temporada,
            boolean novedad) throws MiException {

        // Validar los datos de entrada
        validar(nuevoNombre, nuevaDescripcion, nuevoPrecio, idCategoria);

        // Buscar el producto en la base de datos
        Optional<Producto> respuesta = productoRepositorio.findById(id);

        if (!respuesta.isPresent()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }

        Producto producto = respuesta.get();

        // Si viene una nueva imagen
        if (imagen != null && !imagen.isEmpty()) {
            // Eliminar la imagen anterior si existe
            if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
                String rutaImagen = "src/main/resources/static" + producto.getImagen(); // Ruta de la imagen guardada
                Path rutaCompleta = Paths.get(rutaImagen);

                try {
                    Files.deleteIfExists(rutaCompleta); // Intentar eliminar la imagen anterior
                } catch (IOException e) {
                    e.printStackTrace();
                    throw new MiException("Error al eliminar la imagen anterior: " + e.getMessage());
                }
            }

            // Guardar la nueva imagen
            Path directorioImagenes = Paths.get("src/main/resources/static/img");
            String rutaAbsoluta = directorioImagenes.toFile().getAbsolutePath();

            try {
                byte[] bytesImg = imagen.getBytes();
                Path rutaNuevaImagen = Paths.get(rutaAbsoluta + "/" + imagen.getOriginalFilename());
                Files.write(rutaNuevaImagen, bytesImg); // Guardar la nueva imagen

                // Actualizar la ruta de la imagen en el producto
                producto.setImagen("/img/" + imagen.getOriginalFilename());
            } catch (IOException e) {
                e.printStackTrace();
                throw new MiException("Error al guardar la nueva imagen: " + e.getMessage());
            }
        }
        // Modificar los demás atributos si es necesario
        producto.setNombre(nuevoNombre);
        producto.setDescripcion(nuevaDescripcion);
        producto.setPrecio(nuevoPrecio);
        switch (temporada) {
            case "INVIERNO":
                producto.setTemporada(Temporada.INVIERNO);
                break;

            case "VERANO":
                producto.setTemporada(Temporada.VERANO);
                break;

            case "OTOÑO":
                producto.setTemporada(Temporada.OTOÑO);
                break;

            case "PRIMAVERA":
                producto.setTemporada(Temporada.PRIMAVERA);
                break;

            default:
                break;
        }
        producto.setNovedad(novedad);
        Optional<Categoria> nuevaCategoria = categoriaRepositorio.findById(idCategoria);
        if (nuevaCategoria.isPresent()) {
            producto.setCategoria(nuevaCategoria.get());
        } else {
            throw new IllegalArgumentException("Categoria no encontrada");
        }
        // Guardar el producto modificado en la base de datos
        productoRepositorio.save(producto);
    }

    public Producto getOne(String id) {
        return productoRepositorio.findById(id).orElse(null);
    }

    public List<Producto> obtenerProductosPorIds(List<String> ids) {
        // Implementa la lógica para obtener los productos a partir de los IDs
        return productoRepositorio.findAllById(ids); // Supongamos que tienes un repositorio
    }

    @Transactional
    public void eliminarProducto(String id) throws MiException, IOException {
        Optional<Producto> respuesta = productoRepositorio.findById(id);

        if (respuesta.isPresent()) {
            Producto producto = respuesta.get();

            if (!producto.getImagen().equals("/img/")) {
                // Ruta de la imagen a eliminar
                String rutaImagen = "src/main/resources/static" + producto.getImagen();

                // Eliminar archivo de imagen
                Path rutaCompleta = Paths.get(rutaImagen);
                try {
                    Files.deleteIfExists(rutaCompleta);
                } catch (IOException e) {
                    e.printStackTrace();
                    throw new IOException("Error al eliminar la imagen: " + e.getMessage());
                }
            }

            // Eliminar el producto de la base de datos
            productoRepositorio.delete(producto);
        } else {
            throw new IllegalArgumentException("Producto no encontrado");
        }
    }

}