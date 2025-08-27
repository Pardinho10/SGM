// Variable global para almacenar el ID del propietario en modo de edición.
let idPropietarioEditando = null;

/**
 * Renumera de forma visual las filas de la tabla de propietarios.
 * Esto asegura que la columna 'N°' siempre sea consecutiva.
 */
function renumerarFilas() {
  const filas = document.querySelectorAll("#tablaPropietarios tbody tr");
  filas.forEach((fila, index) => {
    const celda = fila.querySelector(".numero-fila");
    if (celda) {
      celda.textContent = index + 1;
    }
  });
}

/**
 * Actualiza el contador total de registros en la página.
 * Cuenta las filas de la tabla y actualiza el elemento HTML correspondiente.
 */
function actualizarTotalRegistros() {
  const totalFilas = document.querySelectorAll("#tablaPropietarios tbody tr").length;
  const elementoTotal = document.getElementById("total-registros");

  if (elementoTotal) {
    elementoTotal.textContent = totalFilas;
  }
}

// Llama a la función de renumerar filas cuando la página ha cargado por completo.
document.addEventListener("DOMContentLoaded", function () {
  renumerarFilas();
});

/**
 * Muestra la sección de detalles de un propietario y carga sus datos.
 * @param {string} id - El ID del propietario a mostrar.
 */
function mostrarDetalles(id) {
  fetch(`/ver/${id}`)
    .then((response) => response.json())
    .then((data) => {
      // Asigna los datos a los elementos HTML de la sección de detalles.
      const detalleId = document.getElementById("detalle-id");
      const detalleNombre = document.getElementById("detalle-nombre");
      const detalleApellido = document.getElementById("detalle-apellido");
      const detalleDni = document.getElementById("detalle-dni");
      const detalleDierccio = document.getElementById("detalle-direccion");

      if (detalleId) detalleId.textContent = data.codigo_id;
      if (detalleNombre) detalleNombre.textContent = data.nombre;
      if (detalleApellido) detalleApellido.textContent = data.apellido;
      if (detalleDni) detalleDni.textContent = data.dni;
      if (detalleDierccio) detalleDierccio.textContent = data.direccion;
      
      // Muestra la sección y se desplaza suavemente hacia ella.
      document.getElementById("seccionDetalles").style.display = "block";
      document.getElementById("seccionDetalles").scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar los detalles");
    });
}

/**
 * Oculta la sección de detalles del propietario.
 */
function ocultarDetalles() {
  document.getElementById("seccionDetalles").style.display = "none";
}

/**
 * Muestra el formulario para agregar un nuevo propietario.
 */
function mostrarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "block";
}

/**
 * Oculta el formulario para agregar o editar un propietario.
 */
function ocultarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "none";
}

/**
 * Inicia el proceso de edición, cargando los datos del propietario en el formulario.
 * @param {string} id - El ID del propietario a editar.
 */
function iniciarEdicion(id) {
  idPropietarioEditando = id;
  const formPropietario = document.getElementById("formPropietario");
  if (formPropietario) {
    formPropietario.setAttribute("data-modo", "editar");
  }

  const seccionFormulario = document.getElementById("seccionAgregarP");
  if (seccionFormulario) {
    seccionFormulario.style.display = "block";
    seccionFormulario.scrollIntoView({ behavior: "smooth" });
  }

  fetch(`/editar/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const editCodigoId = document.getElementById("edit-codigo-id");
      const editNombre = document.getElementById("edit-nombre");
      const editApellido = document.getElementById("edit-apellido");
      const editDni = document.getElementById("edit-dni");
      const editDireccion = document.getElementById("edit-direccion");

      if (editCodigoId) editCodigoId.value = data.codigo_id;
      if (editNombre) editNombre.value = data.nombre;
      if (editApellido) editApellido.value = data.apellido;
      if (editDni) editDni.value = data.dni;
      if (editDireccion) editDireccion.value = data.direccion;
    })
    .catch((error) => {
      console.error("Error al cargar datos para edición:", error);
      alert("Error al cargar los datos del propietario para editar.");
    });
}

/**
 * Maneja el envío del formulario para agregar o actualizar un propietario.
 * Utiliza AJAX para enviar los datos al servidor.
 * @param {Event} event - El evento de envío del formulario.
 */
function enviarFormulario(event) {
  event.preventDefault();

  document.getElementById("mensajeExito").classList.add("d-none");
  document.getElementById("mensajeError").classList.add("d-none");

  const form = event.target;
  const formData = new FormData(form);
  const modo = form.getAttribute("data-modo");

  let url = "/agregar";
  let method = "POST";

  if (modo === "editar" && idPropietarioEditando) {
    url = `/actualizar/${idPropietarioEditando}`;
    method = "POST";
  }

  const btnEnviar = event.target.querySelector('[type="submit"]');
  const textoOriginal = btnEnviar.innerHTML;
  btnEnviar.disabled = true;
  btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

  fetch(url, {
      method: method,
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
        if (modo === "editar") {
          actualizarFilaTabla(idPropietarioEditando, data.propietario);
          document.getElementById("textoExito").textContent =
            "Propietario actualizado correctamente.";
        } else {
          agregarFilaTabla(data.propietario);
          document.getElementById("textoExito").textContent =
            "El propietario ha sido agregado correctamente.";
          renumerarFilas();
          actualizarTotalRegistros();
        }

        document.getElementById("mensajeExito").classList.remove("d-none");
        limpiarFormulario();
      } else {
        document.getElementById("textoError").textContent = data.error || "Error desconocido";
        document.getElementById("mensajeError").classList.remove("d-none");
      }
      setTimeout(() => {
        document.getElementById("mensajeExito").classList.add("d-none");
        document.getElementById("mensajeError").classList.add("d-none");
      }, 3000);
    })
    .catch((error) => {
      document.getElementById("textoError").textContent = error.message || "Error de conexión. Intente nuevamente.";
      document.getElementById("mensajeError").classList.remove("d-none");
      console.error("Error:", error);
    })
    .finally(() => {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
    });
}

/**
 * Agrega una nueva fila a la tabla con los datos del propietario.
 * @param {object} propietario - El objeto con los datos del nuevo propietario.
 */
function agregarFilaTabla(propietario) {
  const tabla = document.getElementById("tablaPropietarios").querySelector("tbody");
  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td class="numero-fila"></td>
    <td scope="row">${propietario.codigo_id}</td>
    <td>${propietario.nombre}</td>
    <td>${propietario.apellido}</td>
    <td>${propietario.dni}</td>
    <td>${propietario.direccion}</td>
    <td>
      <button class="btn btn-sm btn-success" onclick="mostrarDetalles('${propietario.codigo_id}')">Ver</button>
      <button class="btn btn-sm btn-primary" onclick="iniciarEdicion('${propietario.codigo_id}')">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="eliminarPropietario('${propietario.codigo_id}')">Eliminar</button>
    </td>`;

  tabla.appendChild(fila);
}

/**
 * Actualiza una fila existente en la tabla con los nuevos datos.
 * @param {string} id - El ID del propietario a actualizar.
 * @param {object} datosActualizados - El objeto con los nuevos datos del propietario.
 */
function actualizarFilaTabla(id, datosActualizados) {
  console.log(datosActualizados);
  const filas = document.querySelectorAll("#tablaPropietarios tbody tr");
  filas.forEach((fila) => {
    const codigoIdCelda = fila.cells[1];
    if (codigoIdCelda && codigoIdCelda.textContent == id) {
      fila.cells[1].textContent = datosActualizados.codigo_id;
      fila.cells[2].textContent = datosActualizados.nombre;
      fila.cells[3].textContent = datosActualizados.apellido;
      fila.cells[4].textContent = datosActualizados.dni;
      fila.cells[5].textContent = datosActualizados.direccion;

      const botones = fila.cells[6];
      botones.innerHTML = `
        <button class="btn btn-sm btn-success" onclick="mostrarDetalles('${datosActualizados.codigo_id}')">Ver</button>
        <button class="btn btn-sm btn-primary" onclick="iniciarEdicion('${datosActualizados.codigo_id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPropietario('${datosActualizados.codigo_id}')">Eliminar</button>
      `;
    }
  });
}

/**
 * Elimina un registro de la base de datos y de la tabla HTML.
 * @param {string} id - El ID del propietario a eliminar.
 */
function eliminarPropietario(id) {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    let url = `/eliminar/${id}`;
    let method = "DELETE";
    fetch(url, {
      method: method,
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en el servidor");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        const filaEliminar = document.querySelector(
          `#tablaPropietarios tbody tr[data-id="${id}"]`
        );
        if (filaEliminar) {
          filaEliminar.remove();
          alert("Propietario eliminado");
          renumerarFilas();
          actualizarTotalRegistros();
        }
      } else {
        alert(data.error || "Error al eliminar el propietario.");
      }
    })
    .catch((error) => {
      document.getElementById("textoError").textContent =
        error.message || "Error de conexión. Intente nuevamente.";
      document.getElementById("mensajeError").classList.remove("d-none");
      console.error("Error:", error);
    });
  }
}

/**
 * Limpia los campos del formulario de agregar/editar.
 */
function limpiarFormulario() {
  const editCodigoId = document.getElementById("edit-codigo-id");
  const addNombre = document.getElementById("edit-nombre");
  const addApellido = document.getElementById("edit-apellido");
  const addDni = document.getElementById("edit-dni");
  const addDireccion = document.getElementById("edit-direccion");

  if (editCodigoId) editCodigoId.value = "";
  if (addNombre) addNombre.value = "";
  if (addApellido) addApellido.value = "";
  if (addDni) addDni.value = "";
  if (addDireccion) addDireccion.value = "";

  const form = document.querySelector("form");
  if (form) form.classList.remove("was-validated");
}

/**
 * Habilita la validación nativa de Bootstrap para los formularios.
 * Se ejecuta al cargar la página para detectar envíos inválidos.
 */
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
