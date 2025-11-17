// ----- LOGIN -----
function iniciarSesion() {
  const usuario = document.getElementById('usuario').value;
  const clave = document.getElementById('clave').value;

  // Ejemplo simple de validación
  if(usuario === 'admin' && clave === 'admin') {
    document.getElementById('login').style.display = 'none';
    document.getElementById('contenido').style.display = 'block';
  } else {
    alert('Usuario o contraseña incorrectos');
  }
}

// Detectar Enter en inputs de login
  const loginInputs = [document.getElementById('usuario'), document.getElementById('clave')];
  loginInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        iniciarSesion(); // Llama a tu función existente
      }
    });
  });

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  document.getElementById("contenido").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("usuario").value = "";
  document.getElementById("password").value = "";
});


// ----- MOSTRAR FORMULARIOS -----
function showForm(formId) {
  document.getElementById("form-psico").style.display = "none";
  document.getElementById("form-derivacion").style.display = "none";
  document.getElementById("form-" + formId).style.display = "block";
}



// ----- ENVIAR FORMULARIO -----
async function submitForm(evt, formType) {
  evt.preventDefault();
  const form = evt.target;
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formType, data })
  });
  const js = await res.json();
  if (res.ok && js.ok) {
    alert('Guardado ✅');
    form.reset();
  } else {
    alert('Error: ' + js.msg);
  }
}

// ----- PASOS FICHA PSICOPEDAGÓGICA -----
let currentStep = 0;
function showStep(n) {
  const steps = document.querySelectorAll('#form-psico-data .step');
  const btnPrev = document.querySelector('#form-psico-data .nav-buttons button:nth-child(1)');
  const btnNext = document.querySelector('#form-psico-data .nav-buttons button:nth-child(2)');
  const btnSubmit = document.getElementById('submitBtn');
  const btnExcel = document.getElementById('btnExcelPsico');

  steps.forEach((s, i) => s.classList.toggle('active', i === n));
  
  // Control de visibilidad de botones
  btnPrev.style.display = n === 0 ? 'none' : 'inline-block';
  btnNext.style.display = n === steps.length - 1 ? 'none' : 'inline-block';
  btnSubmit.style.display = n === steps.length - 1 ? 'inline-block' : 'none';
  btnExcel.style.display = n === steps.length - 1 ? 'inline-block' : 'none';
}

function nextStep() { currentStep++; showStep(currentStep); }
function prevStep() { currentStep--; showStep(currentStep); }
showStep(currentStep);

function guardarFicha(tipo) {
  let formId = tipo === 'psico' ? 'form-psico' : 'form-derivacion';
  const form = document.getElementById(formId);
  const formData = new FormData(form);

  // Verificar campos vacíos
  for (let [key, value] of formData.entries()) {
    if (!value.trim()) {
      alert(`⚠️ El campo "${key}" es obligatorio.`);
      return;
    }
  }

  
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

function validarFormulario(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll("input, select, textarea");
  let camposFaltantes = [];

  inputs.forEach(input => {
    // Ignorar campos ocultos
    if (input.type === "hidden") return;

    // Verificar radios (por grupo)
    if (input.type === "radio") {
      const grupo = form.querySelectorAll(`input[name='${input.name}']`);
      const algunoMarcado = Array.from(grupo).some(r => r.checked);
      if (!algunoMarcado && !camposFaltantes.includes(input.name)) {
        camposFaltantes.push(input.name);
      }
      return;
    }

    // Verificar campos normales
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

// --- Botón para exportar Excel (con validación incluida)
function exportarExcel(formId, nombreArchivo) {
  if (!validarFormulario(formId)) {
    return; // Detiene la exportación si faltan campos
  }

  const form = document.getElementById(formId);
  const data = [];
  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach(input => {
    let valor = "";
    if (input.type === "radio") {
      if (input.checked) valor = input.value;
      else return;
    } else if (input.type === "checkbox") {
      valor = input.checked ? "Sí" : "No";
    } else {
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

// Mostrar solo ficha psicopedagógica al inicio
document.getElementById('form-derivacion').style.display = 'none';
document.getElementById('form-psico').style.display = 'block';

 
