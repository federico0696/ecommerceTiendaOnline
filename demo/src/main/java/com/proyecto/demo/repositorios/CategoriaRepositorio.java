package com.proyecto.demo.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyecto.demo.entidades.Categoria;

@Repository
public interface CategoriaRepositorio extends JpaRepository<Categoria,String> {

}
