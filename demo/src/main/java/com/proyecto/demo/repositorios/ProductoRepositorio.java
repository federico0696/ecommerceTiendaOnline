package com.proyecto.demo.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.proyecto.demo.entidades.Producto;
import com.proyecto.demo.enumeraciones.Temporada;

@Repository
public interface ProductoRepositorio extends JpaRepository<Producto, String> {

    // @Query("SELECT p FROM Producto p WHERE p.nombre = :nombre")
    // List<Producto> buscarPorNombre(@Param("nombre") String nombre);

    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %:nombre%")
    List<Producto> buscarPorNombre(@Param("nombre") String nombre);

    @Query("SELECT l FROM Producto l WHERE l.categoria = :categoria")
    Producto buscarPorCategoria(@Param("categoria") String categoria);

    @Query("SELECT p FROM Producto p WHERE p.categoria.nombreCategoria = :nombreCategoria")
    List<Producto> findByCategoriaNombre(@Param("nombreCategoria") String nombreCategoria);

    @Query("SELECT p FROM Producto p WHERE p.temporada = :temporada")
    List<Producto> findByTemporada(@Param("temporada") Temporada temporada);

    @Query("SELECT p FROM Producto p WHERE p.novedad = :novedad")
    List<Producto> findByNovedad(@Param("novedad") boolean novedad);

}
