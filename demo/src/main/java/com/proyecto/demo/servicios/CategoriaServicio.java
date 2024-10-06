package com.proyecto.demo.servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proyecto.demo.entidades.Categoria;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.repositorios.CategoriaRepositorio;

import org.springframework.transaction.annotation.Transactional;



@Service
public class CategoriaServicio {
    
    @Autowired
    CategoriaRepositorio categoriaRepositorio;

    private void validar(String nombreCategoria) throws MiException {
        if (nombreCategoria.isEmpty() || nombreCategoria == null) {
            throw new MiException("el nombre no puede ser nulo o estar vacío");
        }
    }

    @Transactional
    public void crearCategoria(String nombreCategoria) throws MiException {
        validar(nombreCategoria);
        Categoria categoria = new Categoria();
        categoria.setNombreCategoria(nombreCategoria);
        categoriaRepositorio.save(categoria); 
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarCategorias() {

        return categoriaRepositorio.findAll();
    }

    @Transactional
    public void modificarCategoria(String idCategoria, String nombreCategoria) throws MiException {
        validar(nombreCategoria);
        Optional<Categoria> respuesta = categoriaRepositorio.findById(idCategoria);
        if (respuesta.isPresent()) {
            Categoria categoria = respuesta.get();
            categoria.setNombreCategoria(nombreCategoria);
            categoriaRepositorio.save(categoria);
        }else{
            throw new MiException("No se encontró la categoria con el ID especificado");
        }
    }

}
