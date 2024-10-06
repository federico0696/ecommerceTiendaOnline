package com.proyecto.demo.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.proyecto.demo.entidades.Usuario;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.servicios.ProductoServicio;
import com.proyecto.demo.servicios.UsuarioServicio;

import jakarta.servlet.http.HttpSession;


@Controller
@RequestMapping("/perfil")
public class PerfilControlador {
    
    @Autowired
    private ProductoServicio productoServicio;

    @Autowired
    private UsuarioServicio usuarioServicio;

    @GetMapping("/perfilUsuario")
    public String perfil(HttpSession session, ModelMap modelo) {
        Usuario usuario = (Usuario) session.getAttribute("usuariosession");
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        for (Usuario aux : usuarios) {
            if (aux.getId().equals(usuario.getId())) {
                modelo.addAttribute("usuario", aux);
            }
        }
        return "perfilUsuario.html";
    }

    @PostMapping("/cambiarFotoPerfil")
    public String cambiarFotoPerfil(@RequestParam(required = false) MultipartFile imagen, HttpSession session, ModelMap modelo) throws MiException {
        Usuario usuario = (Usuario) session.getAttribute("usuariosession");
        usuarioServicio.actualizarFotoPerfil(usuario.getId(), imagen);
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        for (Usuario aux : usuarios) {
            if (aux.getId().equals(usuario.getId())) {
                modelo.addAttribute("usuario", aux);
            }
        }
        return "perfilUsuario.html";
    }

    @PostMapping("/cambiarNombreUsuario")
    public String cambiarNombreUsuario(@RequestParam(required = false) String nombre, HttpSession session, ModelMap modelo) throws MiException {
        Usuario usuario = (Usuario) session.getAttribute("usuariosession");
        usuarioServicio.actualizarNombrePerfil(usuario.getId(), nombre);
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        for (Usuario aux : usuarios) {
            if (aux.getId().equals(usuario.getId())) {
                modelo.addAttribute("usuario", aux);
            }
        }
        return "perfilUsuario.html";
    }

    @PostMapping("/cambiarNombreDomicilio")
    public String cambiarNombreDomicilio(@RequestParam(required = false) String domicilio, HttpSession session, ModelMap modelo) throws MiException {
        Usuario usuario = (Usuario) session.getAttribute("usuariosession");
        usuarioServicio.actualizarDomicilioPerfil(usuario.getId(), domicilio);
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        for (Usuario aux : usuarios) {
            if (aux.getId().equals(usuario.getId())) {
                modelo.addAttribute("usuario", aux);
            }
        }
        return "perfilUsuario.html";
    }

    @PostMapping("/cambiarNombreEmail")
    public String cambiarNombreEmail(@RequestParam(required = false) String email, HttpSession session, ModelMap modelo) throws MiException {
        Usuario usuario = (Usuario) session.getAttribute("usuariosession");
        usuarioServicio.actualizarEmailPerfil(usuario.getId(), email);
        List<Usuario> usuarios = usuarioServicio.listarUsuarios();
        for (Usuario aux : usuarios) {
            if (aux.getId().equals(usuario.getId())) {
                modelo.addAttribute("usuario", aux);
            }
        }
        return "perfilUsuario.html";
    }

}
