package com.proyecto.demo.entidades;

import org.hibernate.annotations.GenericGenerator;

import com.proyecto.demo.enumeraciones.Temporada;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Producto {
    
    @Id
    @GeneratedValue (generator = "uuid") 
    @GenericGenerator (name ="uuid", strategy = "uuid2")
    private String id;

    private String nombre;
    private String descripcion;
    private String imagen;
    private Double precio;
    private boolean novedad;
    private Integer vecesVendido;

    @ManyToOne
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Temporada temporada;

    public Producto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Temporada getTemporada() {
        return temporada;
    }

    public void setTemporada(Temporada temporada) {
        this.temporada = temporada;
    }

    public boolean getNovedad() {
        return novedad;
    }

    public void setNovedad(boolean novedad) {
        this.novedad = novedad;
    }

    public Integer getVecesVendido() {
        return vecesVendido;
    }

    public void setVecesVendido(Integer vecesVendido) {
        this.vecesVendido = vecesVendido;
    }

    
}
