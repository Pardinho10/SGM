// <!-- JavaScript para mostrar/ocultar detalles -->

function mostrarDetalles(id) {
  fetch(`/ver/${id}`)
    .then((response) => response.json())
    .then((data) => {
      
      // Asignar los valores a las constantes
      const detalleId = document.getElementById("detalle-id");
      const detalleNombre = document.getElementById("detalle-nombre");
      const detalleApellido = document.getElementById("detalle-apellido");
      const detalleDni = document.getElementById("detalle-dni");
      const detalleDierccio = document.getElementById("detalle-direccion");

      // Verificar si los elementos existen antes de asignar el valor
      if(detalleId) detalleId.textContent = data.codigo_id;
      if(detalleNombre) detalleNombre.textContent = data.nombre;
      if(detalleApellido) detalleApellido.textContent = data.apellido;
      if(detalleDni) detalleDni.textContent = data.dni;
      if(detalleDierccio) detalleDierccio.textContent = data.direccion;
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

/* function editarDetalles(id) {
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
} */
// Variable global para almacenar el ID en modo edición
let idPropietarioEditando = null;

// Función para mostrar el formulario y cargar los datos del propietario
function iniciarEdicion(id) {
  idPropietarioEditando = id;

  // Establecer el modo del formulario a 'editar'
  const formPropietario = document.getElementById("formPropietario");
  if (formPropietario) {
    formPropietario.setAttribute("data-modo", "editar");
  }

  // Mostrar la sección del formulario
  const seccionFormulario = document.getElementById("seccionAgregarP");
  if (seccionFormulario) {
    seccionFormulario.style.display = "block";
    seccionFormulario.scrollIntoView({ behavior: "smooth" });
  }

  // Cargar los datos del propietario desde el servidor
  fetch(`/editar/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // Asignar los valores a las constantes
      const editNombre = document.getElementById("edit-nombre");
      const editApellido = document.getElementById("edit-apellido");
      const editDni = document.getElementById("edit-dni");
      const editDireccion = document.getElementById("edit-direccion");

      // Verificar si los elementos existen antes de asignar el valor
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
// <!-- JavaScript para manejar seccion Agregar Propietario -->

function mostrarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "block";
}

function ocultarAgregar() {
  document.getElementById("seccionAgregarP").style.display = "none";
}

// <!-- JavaScript para eliminar propietario -->

function eliminarPropietario(id) {
  if (confirm("Estas seguro de eliminar este registro?" )) {
    let url = `/eliminar/${id}`
    let method = 'DELETE'
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
        
      }
    })
    
  }

  
}


function enviarFormulario(event) {
  event.preventDefault(); // Evita que se recargue la página

  // Ocultar mensajes previos
  document.getElementById("mensajeExito").classList.add("d-none");
  document.getElementById("mensajeError").classList.add("d-none");

  // Obtener datos del formulario
  const form = event.target;
  const formData = new FormData(form);
  const modo = form.getAttribute("data-modo");

  let url = "/agregar";
  let method = "POST";

  if (modo === "editar" && idPropietarioEditando) {
    url = `/editar/${idPropietarioEditando}`;
    method = "POST"; // Flask puede usar POST en lugar de PUT para simplicidad
  }

  // Deshabilitar botón mientras se envía
  const btnEnviar = event.target.querySelector('[type="submit"]');
  const textoOriginal = btnEnviar.innerHTML;
  btnEnviar.disabled = true;
  btnEnviar.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';

  // Enviar con AJAX
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
          console.log("Editar");
          console.log(data.propietario);
          // Lógica para actualizar la fila existente
          actualizarFilaTabla(idPropietarioEditando, data.propietario);
          document.getElementById("textoExito").textContent =
            "Propietario actualizado correctamente.";
        } else {
          // Lógica para agregar una nueva fila
          agregarFilaTabla(data.propietario);
          document.getElementById("textoExito").textContent =
            "El propietario ha sido agregado correctamente.";
        }

        document.getElementById("mensajeExito").classList.remove("d-none");
        limpiarFormulario();
      } else {
        document.getElementById("textoError").textContent =
          data.error || "Error desconocido";
        document.getElementById("mensajeError").classList.remove("d-none");
      }
    })
    .catch((error) => {
      document.getElementById("textoError").textContent =
        error.message || "Error de conexión. Intente nuevamente.";
      document.getElementById("mensajeError").classList.remove("d-none");
      console.error("Error:", error);
    })
    .finally(() => {
      // Rehabilitar botón
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = textoOriginal;
    });
}

// Actualizar la fila de la tabla
function actualizarFilaTabla(id, datosActualizados) {
  console.log(datosActualizados);
  const fila = document.querySelector(
    `#tablaPropietarios tbody tr[data-id="${id}"]`
  );
  if (fila) {
    fila.cells[1].textContent = datosActualizados.nombre;
    fila.cells[2].textContent = datosActualizados.apellido;
    fila.cells[3].textContent = datosActualizados.dni;
    fila.cells[4].textContent = datosActualizados.direccion;
  }
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
