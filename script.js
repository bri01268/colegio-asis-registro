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
    alert('Usuario o contraseña incorrectos');
  }
}

// Detectar ENTER en inputs del login
['usuario', 'clave'].forEach(id => {
  document.getElementById(id).addEventListener('keypress', e => {
    if (e.key === 'Enter') iniciarSesion();
  });
});

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  
  // Mostrar login y ocultar contenido
  document.getElementById("contenido").style.display = "none";
  document.getElementById("login").style.display = "block";

  // Ocultar formularios
  document.getElementById("form-psico").style.display = "none";
  document.getElementById("form-derivacion").style.display = "none";

  // Limpiar campos
  document.getElementById("usuario").value = "";
  document.getElementById("clave").value = "";

  // Volver al inicio de la página
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;

});


/* ============================
   MOSTRAR FORMULARIOS
============================ */
function showForm(formId) {
  // Ocultar todo
  document.getElementById("form-psico").style.display = "none";
  document.getElementById("form-derivacion").style.display = "none";

  // Mostrar el que corresponde
  document.getElementById("form-" + formId).style.display = "block";

  // Si entramos a PSICO → Reiniciar pasos
  if (formId === 'psico') {
    currentStep = 0;
    showStep(currentStep);
  }
}


/* ============================
   VALIDAR FORMULARIO GENERAL
============================ */
function validarFormulario(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input, select, textarea");
  let camposFaltantes = [];

  inputs.forEach(input => {
    if (input.type === "hidden") return;

    // Validación de radios por GRUPO
    if (input.type === "radio") {
      const grupo = form.querySelectorAll(`input[name='${input.name}']`);
      const algunoMarcado = Array.from(grupo).some(r => r.checked);

      if (!algunoMarcado && !camposFaltantes.includes(input.name)) {
        camposFaltantes.push(input.name);
      }
      return;
    }

    // Validación de campos normales con required
    if (input.required && !input.value.trim()) {
      camposFaltantes.push(input.name);
    }
  });

  if (camposFaltantes.length > 0) {
    alert("⚠️ Faltan completar los siguientes campos:\n\n" + camposFaltantes.join("\n"));
    return false;
  }
  return true;
}


/* ============================
   GUARDAR FICHAS
============================ */
function guardarFicha(tipo, event) {
  const formId = tipo === 'psico' ? 'form-psico-data' : 'form-derivacion';
  const form = document.getElementById(formId);
  if (event) event.preventDefault();
  // Validación real antes de guardar
  if (!validarFormulario(formId)) return;

  const formData = new FormData(form);

  const url = tipo === 'psico'
    ? 'https://jeryroldan.github.io/colegio-Asis/php/guardar_psico.php'
    : 'https://jeryroldan.github.io/colegio-Asis/php/guardar_derivacion.php';

  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert(data.msg);
    if (data.ok) form.reset();
  })
  .catch(err => alert("❌ Error al guardar: " + err));
  
}


/* ============================
   EXPORTAR A EXCEL
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
    } 
    else if (input.type === "checkbox") {
      valor = input.checked ? "Sí" : "No";
    } 
    else {
      valor = input.value;
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
}


/* ============================
   PASOS MULTI-STEP - PSICOPEDAGÓGICA
============================ */
let currentStep = 0;

function showStep(n) {
  const steps = document.querySelectorAll('#form-psico-data .step');
  const btnPrev = document.querySelector('#form-psico-data .nav-buttons button:nth-child(1)');
  const btnNext = document.querySelector('#form-psico-data .nav-buttons button:nth-child(2)');
  const btnSubmit = document.getElementById('submitBtn');
  const btnExcel = document.getElementById('btnExcelPsico');

  steps.forEach((s, i) => s.classList.toggle('active', i === n));

  btnPrev.style.display = n === 0 ? 'none' : 'inline-block';
  btnNext.style.display = n === steps.length - 1 ? 'none' : 'inline-block';
  btnSubmit.style.display = n === steps.length - 1 ? 'inline-block' : 'none';
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

showStep(currentStep); // Inicializar


/* ============================
   INICIO AUTOMÁTICO
============================ */
document.getElementById('form-derivacion').style.display = 'none';
document.getElementById('form-psico').style.display = 'block';
