document.addEventListener("DOMContentLoaded", () => {
  const events = [
    {
      id: "agregar-registro-propios",
      action: () => agregarFila("productos-propios"),
    },
    {
      id: "agregar-registro-competencia",
      action: () => agregarFila("productos-competencia"),
    },
    {
      id: "eliminar-registro-propios",
      action: () => eliminarFilasSeleccionadas("productos-propios"),
    },
    {
      id: "eliminar-registro-competencia",
      action: () => eliminarFilasSeleccionadas("productos-competencia"),
    },
    { id: "importar-propios", action: () => importExcel("productos-propios") },
    {
      id: "importar-competencia",
      action: () => importExcel("productos-competencia"),
    },
    {
      id: "exportar-propios",
      action: () => exportarExcel("productos-propios", "Productos Propios"),
    },
    {
      id: "exportar-competencia",
      action: () =>
        exportarExcel("productos-competencia", "Productos Competencia"),
    },
    { id: "solicitar-aprobacion", action: solicitarAprobacion },
    { id: "cargar-excel", action: cargarExcel },
    {
      className: "close",
      action: () => (document.getElementById("modal").style.display = "none"),
    },
    {
      id: "volver",
      action: () => (document.getElementById("modal").style.display = "none"),
    },
  ];

  events.forEach((event) => {
    if (event.id) {
      document.getElementById(event.id).addEventListener("click", event.action);
    } else if (event.className) {
      document
        .getElementsByClassName(event.className)[0]
        .addEventListener("click", event.action);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("excel-link")) {
      event.preventDefault();
      cargarExcel();
    }
  });
  // Event listener para el checkbox maestro
  document
    .getElementById("select-all")
    .addEventListener("change", (event) => {
      seleccionarTodosCheckboxes("productos-propios", event.target.checked);
    });
    // Event listener para el botón de eliminar seleccionados
    // document.getElementById("eliminar-todos").addEventListener("click", () => {
    // eliminarFilasSeleccionadas("productos-propios");
    // });
});

function agregarFila(tableId) {
  const table = document
    .getElementById(tableId)
    .getElementsByTagName("tbody")[0];
  const row = table.insertRow();
  let cells;

  if (tableId === "productos-propios") {
    cells = [
      '<input type="checkbox">',
      '<input type="text" placeholder="Producto">',
      '<input type="text" placeholder="Cliente">',
      '<input type="number" placeholder="Precio" step="0.01">',
      '<input type="number" placeholder="Costo Total" step="0.01">',
      '<input type="number" placeholder="Costo HFV" step="0.01"><br><button class="excel-link inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 sm:ml-3 sm:w-auto" id="cargar-excel">Ver Costos</button>',
      '<input type="text" placeholder="Cmg $" readonly>',
      '<input type="text" placeholder="Cmg %" readonly>',
      '<input type="email" placeholder="Responsable Pricing (Email)">',
    ];
  } else if (tableId === "productos-competencia") {
    cells = [
      '<input type="checkbox">',
      '<input type="text" placeholder="Laboratorio">',
      '<input type="text" placeholder="Producto">',
      '<input type="text" placeholder="Cliente">',
      '<input type="date" placeholder="Fecha">',
      '<input type="number" placeholder="Precio" step="0.01">',
      "",
    ];
  }

  cells.forEach((cellContent) => {
    const cell = row.insertCell();
    cell.innerHTML = cellContent;
  });

  // Añadir event listeners según sea necesario
  if (tableId === "productos-propios") {
    const inputPrecio = row.cells[3].querySelector("input");
    const inputCostoTotal = row.cells[4].querySelector("input");
    const inputCostoHFV = row.cells[5].querySelector("input");
    const inputCmgDolar = row.cells[6].querySelector("input");
    const inputCmgPorc = row.cells[7].querySelector("input");

    [inputPrecio, inputCostoTotal, inputCostoHFV].forEach((input) => {
      input.addEventListener("input", () =>
        calcularCostoMarginal(
          inputPrecio,
          inputCostoTotal,
          inputCostoHFV,
          inputCmgDolar,
          inputCmgPorc
        )
      );
    });
  } else if (tableId === "productos-competencia") {
    const inputPrecio = row.cells[5].querySelector("input");
    const cellIndicador = row.cells[6];

    inputPrecio.addEventListener("input", () =>
      actualizarIndicador(inputPrecio, cellIndicador)
    );
  }
}
console.log(agregarFila);
function calcularCostoMarginal(
  inputPrecio,
  inputCostoTotal,
  inputCostoHFV,
  inputCmgDolar,
  inputCmgPorc
) {
  const precio = parseFloat(inputPrecio.value);
  const costoTotal = parseFloat(inputCostoTotal.value);
  const costoHFV = parseFloat(inputCostoHFV.value);

  if (!isNaN(precio) && !isNaN(costoTotal) && !isNaN(costoHFV)) {
    const cmgDolar = precio - (costoTotal + costoHFV);
    const cmgPorc = (cmgDolar / precio) * 100;

    inputCmgDolar.value = cmgDolar.toFixed(2);
    inputCmgPorc.value = cmgPorc.toFixed(2);
  } else {
    inputCmgDolar.value = "";
    inputCmgPorc.value = "";
  }
}

function actualizarIndicador(inputPrecioCompetencia, cellIndicador) {
  const productosPropios = document.querySelectorAll(
    "#productos-propios tbody tr"
  );

  let precioPropioMenor = false;
  productosPropios.forEach((row) => {
    const inputPrecioPropio = row.cells[3].querySelector("input");
    const precioPropio = parseFloat(inputPrecioPropio.value);

    if (
      !isNaN(precioPropio) &&
      !isNaN(parseFloat(inputPrecioCompetencia.value))
    ) {
      if (precioPropio > parseFloat(inputPrecioCompetencia.value)) {
        precioPropioMenor = true;
      }
    }
  });

  if (precioPropioMenor) {
    cellIndicador.innerHTML = '<div class="indicador-verde">✔</div>';
  } else {
    cellIndicador.innerHTML = '<div class="indicador-rojo">✘</div>';
  }
}

function eliminarFilasSeleccionadas(tableId) {
  const table = document
    .getElementById(tableId)
    .getElementsByTagName("tbody")[0];
  const checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');

  if (checkboxes.length === 0) {
    alert("Por favor selecciona una fila a eliminar");
    return;
  }

  checkboxes.forEach((checkbox) => {
    const row = checkbox.closest("tr");
    row.remove();
  });
}
function seleccionarTodosCheckboxes(tableId, seleccionar) {
  const checkboxes = document.querySelectorAll(
    `#${tableId} tbody input[type="checkbox"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = seleccionar;
  });
}

/**
|--------------------------------------------------
| 
function importExcel(tableId) {
  // Lógica para importar datos desde un archivo Excel
  // Por simplicidad, esta parte se omite
  alert("Función de importar Excel aún no implementada");}
|--------------------------------------------------
*/
function importExcel(tableId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const table = document
        .getElementById(tableId)
        .getElementsByTagName("tbody")[0];

      jsonData.forEach((row) => {
        let matchFound = false;

        // Comparar cada fila del Excel con las filas de la tabla
        for (let i = 0; i < table.rows.length; i++) {
          const existingRow = table.rows[i];
          if (
            existingRow.cells[1].textContent === row["Producto"] &&
            existingRow.cells[2].textContent === row["Cliente"]
          ) {
            // Actualizar la fila existente con los nuevos datos
            existingRow.cells[3].textContent = row["Precio"];
            existingRow.cells[4].textContent = row["Costo Total"];
            existingRow.cells[5].textContent = row["Costo HFV"];
            existingRow.cells[6].textContent = row["Cmg $"];
            existingRow.cells[7].textContent = row["Cmg %"];
            existingRow.cells[8].textContent =
              row["Responsable Pricing (Email)"];

            matchFound = true;
            break;
          }
        }

        // Si no se encontró una fila coincidente, agregar una nueva fila
        if (!matchFound) {
          const newRow = table.insertRow();
          const checkboxCell = newRow.insertCell(0);
          checkboxCell.innerHTML = '<input type="checkbox">';

          const values = [
            row["Producto"],
            row["Cliente"],
            row["Precio"],
            row["Costo Total"],
            row["Costo HFV"],
            row["Cmg $"],
            row["Cmg %"],
            row["Responsable Pricing (Email)"],
          ];

          values.forEach((value) => {
            const newCell = newRow.insertCell();
            newCell.textContent = value;
          });
        }
      });
    };

    reader.readAsArrayBuffer(file);
  });

  input.click();
}
// new DataTable("#example");

function exportarExcel(tableId, sheetName) {
  const table = document.getElementById(tableId);
  const rows = Array.from(table.querySelectorAll("tr"));
  const data = rows.map((row) => {
    return Array.from(row.querySelectorAll("th, td")).map((cell) => {
      return cell.querySelector("input")
        ? cell.querySelector("input").value
        : cell.textContent;
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, "Precios_Richmond_vs_Competencia.xlsx");
}

function solicitarAprobacion() {
  const emails = [];
  const productosPropios = document.querySelectorAll(
    "#productos-propios tbody tr"
  );
  const productosCompetencia = document.querySelectorAll(
    "#productos-competencia tbody tr"
  );
  let valid = true;

  productosPropios.forEach((row) => {
    const inputEmail = row.cells[8].querySelector("input");
    if (inputEmail && inputEmail.value) {
      if (validateEmail(inputEmail.value)) {
        emails.push(inputEmail.value);
      } else {
        alert(`Email inválido: ${inputEmail.value}`);
        valid = false;
      }
    }
  });

  if (valid && emails.length > 0) {
    const subject = `Solicitud de Aprobación para Cambio de Precios`;
    let body = `Por favor, revise y apruebe los cambios de precios.\n\nProductos Propios:\n`;

    productosPropios.forEach((row) => {
      const producto = row.cells[1].querySelector("input").value;
      const cliente = row.cells[2].querySelector("input").value;
      const precio = row.cells[3].querySelector("input").value;
      const costoTotal = row.cells[4].querySelector("input").value;
      const costoHFV = row.cells[5].querySelector("input").value;
      const cmgDolar = row.cells[6].querySelector("input").value;
      const cmgPorc = row.cells[7].querySelector("input").value;
      body += `Producto: ${producto}, Cliente: ${cliente}, Precio: ${precio}, Costo Total: ${costoTotal}, Costo HFV: ${costoHFV}, Cmg $: ${cmgDolar}, Cmg %: ${cmgPorc}\n`;
    });

    body += `\nProductos Competencia:\n`;

    productosCompetencia.forEach((row) => {
      const laboratorio = row.cells[1].querySelector("input").value;
      const producto = row.cells[2].querySelector("input").value;
      const cliente = row.cells[3].querySelector("input").value;
      const fecha = row.cells[4].querySelector("input").value;
      const precio = row.cells[5].querySelector("input").value;
      body += `Laboratorio: ${laboratorio}, Producto: ${producto}, Cliente: ${cliente}, Fecha: ${fecha}, Precio: ${precio}\n`;
    });

    const mailtoLink = `mailto:${emails.join(",")}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  } else if (!valid) {
    alert("Corrige los emails inválidos antes de continuar.");
  } else {
    alert("No hay responsables de email especificados.");
  }
}

function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Cargar archivo Excel y mostrar en el modal
function cargarExcel() {
  const url = "/data/costos_hfv_competencia.xlsx"; // Asegúrate de que la ruta sea correcta
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.arrayBuffer();
    })
    .then((data) => {
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const htmlString = XLSX.utils.sheet_to_html(sheet);
      document.getElementById("excel-content").innerHTML = htmlString;
      document.getElementById("modal").style.display = "block";
    })
    .catch((error) => {
      console.error("Error al cargar el archivo Excel:", error);
      document.getElementById("excel-content").innerHTML =
        "<p>Error al cargar el archivo Excel.</p>";
      document.getElementById("modal").style.display = "block";
    });
}
