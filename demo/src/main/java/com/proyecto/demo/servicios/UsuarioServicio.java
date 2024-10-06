package com.proyecto.demo.servicios;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import com.proyecto.demo.entidades.Usuario;
import com.proyecto.demo.enumeraciones.Rol;
import com.proyecto.demo.excepciones.MiException;
import com.proyecto.demo.repositorios.UsuarioRepositorio;

import jakarta.servlet.http.HttpSession;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UsuarioServicio implements UserDetailsService{
    
    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void registrar(MultipartFile imagen, String nombre, String email, String password, String password2) throws MiException{

        validar(nombre, email, password, password2);

        Path directorioImagenes = Paths.get("src/main/resources/static/img");
        String rutaAbsoluta = directorioImagenes.toFile().getAbsolutePath();
        try {
            byte[] bytesImg = imagen.getBytes();
            Path rutaCompleta = Paths.get(rutaAbsoluta + "/" + imagen.getOriginalFilename());
            Files.write(rutaCompleta, bytesImg);
        } catch (IOException e) {
            e.printStackTrace();
        }

        Usuario usuario = new Usuario();

        usuario.setNombre(nombre);
        usuario.setEmail(email);

        // Codifica la contraseña antes de guardarla
        String encodedPassword = passwordEncoder.encode(password);
        usuario.setPassword(encodedPassword);

        usuario.setRol(Rol.USER);

        usuario.setImagen("/img/" + imagen.getOriginalFilename());

        usuarioRepositorio.save(usuario);

    }

    public void cambiarRol(String idUsuario){
        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);

        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();

            if (usuario.getRol() == Rol.USER){
                usuario.setRol(Rol.ADMIN);
            } else {
                usuario.setRol(Rol.USER);
            }
            

            usuarioRepositorio.save(usuario);
        }
    }

    public void actualizar(String idUsuario, String nombre, String email, String password, 
            String password2, MultipartFile imagen) throws MiException {

        validar(nombre, email, password, password2);

        Path directorioImagenes = Paths.get("src/main/resources/static/img");
        String rutaAbsoluta = directorioImagenes.toFile().getAbsolutePath();
        try {
            byte[] bytesImg = imagen.getBytes();
            Path rutaCompleta = Paths.get(rutaAbsoluta + "/" + imagen.getOriginalFilename());
            Files.write(rutaCompleta, bytesImg);
        } catch (IOException e) {
            e.printStackTrace();
        }

        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);

        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();

            usuario.setNombre(nombre);
            usuario.setEmail(email);

            String encodedPassword = passwordEncoder.encode(password);
            usuario.setPassword(encodedPassword);

            usuario.setImagen("/img/" + imagen.getOriginalFilename());

            usuarioRepositorio.save(usuario);
        }
    }

    public void actualizarFotoPerfil(String idUsuario, MultipartFile imagen) throws MiException {

        Path directorioImagenes = Paths.get("src/main/resources/static/img");
        String rutaAbsoluta = directorioImagenes.toFile().getAbsolutePath();
        try {
            byte[] bytesImg = imagen.getBytes();
            Path rutaCompleta = Paths.get(rutaAbsoluta + "/" + imagen.getOriginalFilename());
            Files.write(rutaCompleta, bytesImg);
        } catch (IOException e) {
            e.printStackTrace();
        }

        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);

        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();

            usuario.setImagen("/img/" + imagen.getOriginalFilename());

            usuarioRepositorio.save(usuario);
        }
    }

    public void actualizarNombrePerfil(String idUsuario, String nombre) throws MiException {
        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);
        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();
            usuario.setNombre(nombre);
            usuarioRepositorio.save(usuario);
        }
    }

    public void actualizarDomicilioPerfil(String idUsuario, String domicilio) throws MiException {
        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);
        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();
            usuario.setDomicilio(domicilio);
            usuarioRepositorio.save(usuario);
        }
    }

    public void actualizarEmailPerfil(String idUsuario, String email) throws MiException {
        Optional<Usuario> respuesta = usuarioRepositorio.findById(idUsuario);
        if (respuesta.isPresent()) {
            Usuario usuario = respuesta.get();
            usuario.setEmail(email);
            usuarioRepositorio.save(usuario);
        }
    }


    private void validar(String nombre, String email, String password, String password2) throws MiException {
        if (nombre.isEmpty() || nombre == null) {
            throw new MiException("el nombre no puede ser nulo o estar vacío");
        }
        if (email.isEmpty() || email == null) {
            throw new MiException("el email no puede ser nulo o estar vacío");
        }
        if (password.isEmpty() || password == null || password.length() <= 5) {
            throw new MiException("La contraseña no puede estar vacía, y debe tener más de 5 dígitos");
        }
        if (!password.equals(password2)) {
            throw new MiException("Las contraseñas ingresadas deben ser iguales");
        }
    }

    public Usuario getOne(String id) {
        return usuarioRepositorio.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios() {

        return usuarioRepositorio.findAll();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepositorio.buscarPorEmail(email);

        if (usuario != null) {

            List<GrantedAuthority> permisos = new ArrayList();

            GrantedAuthority p = new SimpleGrantedAuthority("ROLE_" + usuario.getRol().toString());

            permisos.add(p);

            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();

            HttpSession session = attr.getRequest().getSession(true);

            session.setAttribute("usuariosession", usuario);

            return new User(usuario.getEmail(), usuario.getPassword(), permisos);
        } else {
            return null;
        }
    }


}
