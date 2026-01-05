/* ============================
      LOGIN
============================ */
function iniciarSesion() {
  const usuario = document.getElementById('usuario').value;
  const clave = document.getElementById('clave').value;

  if (usuario === 'admin' && clave === 'admin') {
    document.getElementById('login').style.display = 'none';
    document.getElementById('contenido').style.display = 'block';
  } else {
    document.getElementById('errorLogin').innerText = "Usuario o contraseña incorrectos";
  }
}

// ENTER en login
['usuario', 'clave'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', e => {
    if (e.key === 'Enter') iniciarSesion();
  });
});

// CLICK en botón login
document.getElementById('btnLogin').addEventListener('click', iniciarSesion);


// LOGOUT
document.getElementById("btnLogout").addEventListener("click", () => {
  document.getElementById("contenido").style.display = "none";
  document.getElementById("login").style.display = "flex";
  document.getElementById("errorLogin").innerText = "";
});


/* ============================
      MOSTRAR FORMULARIOS
============================ */
function showForm(formId) {
  document.getElementById("form-psico").style.display = "none";
  document.getElementById("form-derivacion").style.display = "none";
  document.getElementById("form-" + formId).style.display = "block";

  if (formId === "psico") {
    currentStep = 0;
    showStep(currentStep);
  }
}


/* ============================
      VALIDAR CAMPOS
============================ */
function validarFormulario(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input, select, textarea");
  let camposFaltantes = [];

  inputs.forEach(input => {
    if (input.type === "radio") {
      const grupo = form.querySelectorAll(`input[name='${input.name}']`);
      const algunoMarcado = Array.from(grupo).some(r => r.checked);
      if (!algunoMarcado && !camposFaltantes.includes(input.name)) {
        camposFaltantes.push(input.name);
      }
    } else if (input.required && !input.value.trim()) {
      camposFaltantes.push(input.name);
    }
  });

  if (camposFaltantes.length > 0) {
    alert("⚠️ Faltan completar:\n\n" + camposFaltantes.join("\n"));
    return false;
  }
  return true;
}


/* ============================
      DESCARGAR A EXCEL
============================ */
function exportarExcel(formId, nombreArchivo) {
  if (!validarFormulario(formId)) return;

  const form = document.getElementById(formId);
  const data = [];
  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach(input => {
    let valor = "";

    if (input.type === "radio") {
      if (!input.checked) return;
      valor = input.value;
    } else if (input.type === "checkbox") {
      valor = input.checked ? "Sí" : "No";
    } else {
      valor = input.value.trim();
    }

    data.push({
      Campo: input.name || "(sin nombre)",
      Valor: valor
    });
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");

  XLSX.writeFile(wb, nombreArchivo + ".xlsx");

  // 🔹 LIMPIEZA DEL FORMULARIO
  form.reset();

  alert("📥 Descarga completada y formulario limpiado correctamente");
}



/* ============================
      MULTI-STEP PSICO
============================ */
let currentStep = 0;

function showStep(n) {
  const steps = document.querySelectorAll('#form-psico-data .step');
  const btnPrev = document.querySelector('#form-psico-data .nav-buttons button:nth-child(1)');
  const btnNext = document.querySelector('#form-psico-data .nav-buttons button:nth-child(2)');
  const btnExcel = document.getElementById('btnExcelPsico');

  steps.forEach((s, i) => s.classList.toggle('active', i === n));

  btnPrev.style.display = n === 0 ? 'none' : 'inline-block';
  btnNext.style.display = n === steps.length - 1 ? 'none' : 'inline-block';
  btnExcel.style.display = n === steps.length - 1 ? 'inline-block' : 'none';
}

function nextStep() {
  const steps = document.querySelectorAll('#form-psico-data .step');
  if (currentStep < steps.length - 1) currentStep++;
  showStep(currentStep);
}

function prevStep() {
  if (currentStep > 0) currentStep--;
  showStep(currentStep);
}

showStep(currentStep);

/* ============================
   GUARDAR FICHAS SOLO LOCAL
============================ */
function guardarFicha(tipo, event) {
  if (event) event.preventDefault();

  const formId = tipo === 'psico' ? 'form-psico-data' : 'form-derivacion';

  // Validación del formulario
  if (!validarFormulario(formId)) return;

  // Si está todo correcto, mensaje de éxito
  alert("✔️ ¡Datos guardados correctamente en el sistema!");

  // Se limpia el formulario después de guardar
  document.getElementById(formId).reset();
}


/* ============================
      Estado inicial
============================ */
document.getElementById("form-derivacion").style.display = "none";
document.getElementById("form-psico").style.display = "block";
