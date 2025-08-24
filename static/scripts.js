// <!-- JavaScript para mostrar/ocultar detalles -->

function mostrarDetalles(id) {
  fetch(`/ver/${id}`)
    .then((response) => response.json())
    .then((data) => {
      // Usar los datos que llegan del servidor (data.campo)
      document.getElementById("detalle-id").textContent = data.codigo_id;
      document.getElementById("detalle-nombre").textContent = data.nombre;
      document.getElementById("detalle-apellido").textContent = data.apellido;
      document.getElementById("detalle-dni").textContent = data.dni;
      document.getElementById("detalle-direccion").textContent = data.direccion;

      // Mostrar la sección
      document.getElementById("seccionDetalles").style.display = "block";

      // Scroll suave hacia la sección
      document
        .getElementById("seccionDetalles")
        .scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar los detalles");
    });
}

function ocultarDetalles() {
  document.getElementById("seccionDetalles").style.display = "none";
}

// <!-- JavaScript para manejar seccion Editar  Propietario -->

function editarDetalles(id) {
  fetch(`/editar/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Usar los datos que llegan del servidor (data.campo)
      // document.getElementById("edit-id").value = data.codigo_id;
      const editNombre = document.getElementById("edit-nombre");
      const editApellido = document.getElementById("edit-apellido");
      const editDni = document.getElementById("edit-dni");
      const editDireccion = document.getElementById("edit-direccion");

      if (editNombre) editNombre.value = data.nombre;
      if (editApellido) editApellido.value = data.apellido;
      if (editDni) editDni.value = data.dni;
      if (editDireccion) editDireccion.value = data.direccion;

      // Mostrar la sección
      document.getElementById("seccionAgregarP").style.display = "block";

      // Scroll suave hacia la sección
      document
        .getElementById("seccionAgregarP")
        .scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar los detalles");
    });
}

// <!-- JavaScript para manejar seccion Agregar Propietario -->

function mostrarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "block";
}

function ocultarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "none";
}

function enviarFormulario(event) {
  event.preventDefault(); // Evita que se recargue la página

  // Ocultar mensajes previos
  document.getElementById("mensajeExito").classList.add("d-none");
  document.getElementById("mensajeError").classList.add("d-none");

  // Obtener datos del formulario
  const formData = new FormData(event.target);

  // Deshabilitar botón mientras se envía
  const btnEnviar = event.target.querySelector('[type="submit"]');
  const textoOriginal = btnEnviar.innerHTML;
  btnEnviar.disabled = true;
  btnEnviar.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

  // Enviar con AJAX
  fetch("/agregar", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en el servidor");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        const propietario = data.propietario;
        agregarFilaTabla(propietario);
        // Mostrar mensaje de éxito
        document.getElementById("textoExito").textContent =
          data.error || "El propietario ha sido agregado correctamente.";
        document.getElementById("mensajeExito").classList.remove("d-none");
        limpiarFormulario();
      } else {
        // Mostrar error del servidor
        document.getElementById("textoError").textContent =
          data.error || "Error desconocido";
        document.getElementById("mensajeError").classList.remove("d-none");
      }
    })
    .catch((error) => {
      // Mostrar error de conexión
      document.getElementById("textoError").textContent =
        "Error de conexión. Intente nuevamente.";
      document.getElementById("mensajeError").classList.remove("d-none");
      console.error("Error:", error);
    })
    .finally(() => {
      // Rehabilitar botón
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
    });
}

function limpiarFormulario() {
  const addNombre = document.getElementById("edit-nombre");
  const addApellido = document.getElementById("edit-apellido");
  const addDni = document.getElementById("edit-dni");
  const addDireccion = document.getElementById("edit-direccion");

  if (addNombre) addNombre.value = "";
  if (addApellido) addApellido.value = "";
  if (addDni) addDni.value = "";
  if (addDireccion) addDireccion.value = "";

  // Remover clases de validación si las hay
  const form = document.querySelector("form");
  if (form) form.classList.remove("was-validated");

  // Ocultar mensajes
  // document.getElementById('mensajeExito').classList.add('d-none');
  // document.getElementById('mensajeError').classList.add('d-none');
}

// Validación Bootstrap al enviar
(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      const forms = document.getElementsByClassName("needs-validation");
      Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );
})();

function agregarFilaTabla(propietario) {
  const tabla = document
    .getElementById("tablaPropietarios")
    .querySelector("tbody");
  const fila = document.createElement("tr");

  fila.innerHTML = `
            <td scope="row">${propietario.codigo_id}</td>
            <td>${propietario.nombre}</td>
            <td>${propietario.apellido}</td>
            <td>${propietario.dni}</td>
            <td>${propietario.direccion}</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="mostrarDetalles('${propietario.codigo_id}')">Ver</button>
                <button class="btn btn-sm btn-primary">Editar</button>
                <button class="btn btn-sm btn-danger">Eliminar</button>
             </td>
        `;

  tabla.appendChild(fila);
}
