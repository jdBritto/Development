document.addEventListener('DOMContentLoaded', () => {  //'DOMContentLoaded' Fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish load        // Agregar fila para productos propios
        document.getElementById('agregar-registro-propios').addEventListener('click', () => {
            agregarFila('productos-propios');
        });
    
        // Agregar fila para productos de competencia
        document.getElementById('agregar-registro-competencia').addEventListener('click', () => {
            agregarFila('productos-competencia');
        });
    
        // Eliminar fila para productos propios
        document.getElementById('eliminar-registro-propios').addEventListener('click', () => {
            eliminarFilasSeleccionadas('productos-propios');
        });
    
        // Eliminar fila para productos de competencia
        document.getElementById('eliminar-registro-competencia').addEventListener('click', () => {
            eliminarFilasSeleccionadas('productos-competencia');
        });
    
        // Importar Excel
        document.getElementById('importar-propios').addEventListener('click', () => {
            importExcel('productos-propios');
        });
    
        document.getElementById('importar-competencia').addEventListener('click', () => {
            importExcel('productos-competencia');
        });
    
        // Exportar Excel
        document.getElementById('exportar-propios').addEventListener('click', () => {
            exportarExcel('productos-propios', 'Productos Propios');
        });
    
        document.getElementById('exportar-competencia').addEventListener('click', () => {
            exportarExcel('productos-competencia', 'Productos Competencia');
        });
    
        // Solicitar aprobación
        document.getElementById('solicitar-aprobacion').addEventListener('click', () => {
            solicitarAprobacion();
        });

        document.getElementById('cargar-excel').addEventListener('click', cargarExcel);

        // Manejar el enlace para mostrar el modal
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('excel-link')) {
                event.preventDefault();
                cargarExcel();
            }
        });
    
        // Cerrar el modal
        document.getElementsByClassName('close')[0].addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });
        
    
        document.getElementById('volver').addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });
    
        function agregarFila(tableId) {
            const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
            const row = table.insertRow();
    
            if (tableId === 'productos-propios') {
                const cellCheckbox = row.insertCell(0);
                const cellProducto = row.insertCell(1);
                const cellCliente = row.insertCell(2);
                const cellPrecio = row.insertCell(3);
                const cellCostoTotal = row.insertCell(4);
                const cellCostoHFV = row.insertCell(5);
                const cellCmgDolar = row.insertCell(6);
                const cellCmgPorc = row.insertCell(7);
                const cellEmail = row.insertCell(8);
    
                cellCheckbox.innerHTML = `<input type="checkbox">`;
                cellProducto.innerHTML = `<input type="text" placeholder="Producto">`;
                cellCliente.innerHTML = `<input type="text" placeholder="Cliente">`;
                cellPrecio.innerHTML = `<input type="number" placeholder="Precio" step="0.01">`;
                cellCostoTotal.innerHTML = `<input type="number" placeholder="Costo Total" step="0.01">`;
                cellCostoHFV.innerHTML = `<input type="number" placeholder="Costo HFV" step="0.01"><br><button class="excel-link btn btn-primary" id="cargar-excel">Ver Costos</button>`;
                cellCmgDolar.innerHTML = `<input type="text" placeholder="Cmg $" readonly>`;
                cellCmgPorc.innerHTML = `<input type="text" placeholder="Cmg %" readonly>`;
                cellEmail.innerHTML = `<input type="email" placeholder="Responsable Pricing (Email)">`;
    
                // Event listeners para calcular el costo marginal
                const inputPrecio = cellPrecio.querySelector('input');
                const inputCostoTotal = cellCostoTotal.querySelector('input');
                const inputCostoHFV = cellCostoHFV.querySelector('input');
                const inputCmgDolar = cellCmgDolar.querySelector('input');
                const inputCmgPorc = cellCmgPorc.querySelector('input');
    
                inputPrecio.addEventListener('input', () => calcularCostoMarginal(inputPrecio, inputCostoTotal, inputCostoHFV, inputCmgDolar, inputCmgPorc));
                inputCostoTotal.addEventListener('input', () => calcularCostoMarginal(inputPrecio, inputCostoTotal, inputCostoHFV, inputCmgDolar, inputCmgPorc));
                inputCostoHFV.addEventListener('input', () => calcularCostoMarginal(inputPrecio, inputCostoTotal, inputCostoHFV, inputCmgDolar, inputCmgPorc));
            }
    
            if (tableId === 'productos-competencia') {
                const cellCheckbox = row.insertCell(0);
                const cellLaboratorio = row.insertCell(1);
                const cellProducto = row.insertCell(2);
                const cellCliente = row.insertCell(3);
                const cellFecha = row.insertCell(4);
                const cellPrecio = row.insertCell(5);
                const cellIndicador = row.insertCell(6);
    
                cellCheckbox.innerHTML = `<input type="checkbox">`;
                cellLaboratorio.innerHTML = `<input type="text" placeholder="Laboratorio">`;
                cellProducto.innerHTML = `<input type="text" placeholder="Producto">`;
                cellCliente.innerHTML = `<input type="text" placeholder="Cliente">`;
                cellFecha.innerHTML = `<input type="date" placeholder="Fecha">`;
                cellPrecio.innerHTML = `<input type="number" placeholder="Precio" step="0.01">`;
                cellIndicador.innerHTML = '';
    
                const inputPrecio = cellPrecio.querySelector('input');
                inputPrecio.addEventListener('input', () => actualizarIndicador(inputPrecio, cellIndicador));
            }
        }
    
        function calcularCostoMarginal(inputPrecio, inputCostoTotal, inputCostoHFV, inputCmgDolar, inputCmgPorc) {
            const precio = parseFloat(inputPrecio.value);
            const costoTotal = parseFloat(inputCostoTotal.value);
            const costoHFV = parseFloat(inputCostoHFV.value);
    
            if (!isNaN(precio) && !isNaN(costoTotal) && !isNaN(costoHFV)) {
                const cmgDolar = precio - (costoTotal + costoHFV);
                const cmgPorc = (cmgDolar / precio) * 100;
    
                inputCmgDolar.value = cmgDolar.toFixed(2);
                inputCmgPorc.value = cmgPorc.toFixed(2);
            } else {
                inputCmgDolar.value = '';
                inputCmgPorc.value = '';
            }
        }
    
        function actualizarIndicador(inputPrecioCompetencia, cellIndicador) {
            const productosPropios = document.querySelectorAll('#productos-propios tbody tr');
    
            let precioPropioMenor = false;
            productosPropios.forEach(row => {
                const inputPrecioPropio = row.cells[3].querySelector('input');
                const precioPropio = parseFloat(inputPrecioPropio.value);
    
                if (!isNaN(precioPropio) && !isNaN(parseFloat(inputPrecioCompetencia.value))) {
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
            const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
            const checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');
    
            if (checkboxes.length === 0) {
                alert('Por favor selecciona una fila a eliminar');
                return;
            }
    
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                row.remove();
            });
        }
    
        function importExcel(tableId) {
            // Lógica para importar datos desde un archivo Excel
            // Por simplicidad, esta parte se omite
            alert('Función de importar Excel aún no implementada');
        }
        new DataTable('#example');
    
        function exportarExcel(tableId, sheetName) {
            const table = document.getElementById(tableId);
            const rows = Array.from(table.querySelectorAll('tr'));
            const data = rows.map(row => {
                return Array.from(row.querySelectorAll('th, td')).map(cell => {
                    return cell.querySelector('input') ? cell.querySelector('input').value : cell.textContent;
                });
            });
    
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
    
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, 'Precios_Richmond_vs_Competencia.xlsx');
        }
    
        function solicitarAprobacion() {
            const emails = [];
            const productosPropios = document.querySelectorAll('#productos-propios tbody tr');
            const productosCompetencia = document.querySelectorAll('#productos-competencia tbody tr');
            let valid = true;
    
            productosPropios.forEach(row => {
                const inputEmail = row.cells[8].querySelector('input');
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
    
                productosPropios.forEach(row => {
                    const producto = row.cells[1].querySelector('input').value;
                    const cliente = row.cells[2].querySelector('input').value;
                    const precio = row.cells[3].querySelector('input').value;
                    const costoTotal = row.cells[4].querySelector('input').value;
                    const costoHFV = row.cells[5].querySelector('input').value;
                    const cmgDolar = row.cells[6].querySelector('input').value;
                    const cmgPorc = row.cells[7].querySelector('input').value;
                    body += `Producto: ${producto}, Cliente: ${cliente}, Precio: ${precio}, Costo Total: ${costoTotal}, Costo HFV: ${costoHFV}, Cmg $: ${cmgDolar}, Cmg %: ${cmgPorc}\n`;
                });
    
                body += `\nProductos Competencia:\n`;
    
                productosCompetencia.forEach(row => {
                    const laboratorio = row.cells[1].querySelector('input').value;
                    const producto = row.cells[2].querySelector('input').value;
                    const cliente = row.cells[3].querySelector('input').value;
                    const fecha = row.cells[4].querySelector('input').value;
                    const precio = row.cells[5].querySelector('input').value;
                    body += `Laboratorio: ${laboratorio}, Producto: ${producto}, Cliente: ${cliente}, Fecha: ${fecha}, Precio: ${precio}\n`;
                });
    
                const mailtoLink = `mailto:${emails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoLink;
            } else if (!valid) {
                alert('Corrige los emails inválidos antes de continuar.');
            } else {
                alert('No hay responsables de email especificados.');
            }
        }
    
        function validateEmail(email) {
            const re = /\S+@\S+\.\S+/;
            return re.test(email);
        }
    
        // Cargar archivo Excel y mostrar en el modal
        function cargarExcel() {
            const url = '../data/costos_hfv_competencia.xlsx'; // Asegúrate de que la ruta sea correcta
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.arrayBuffer();
                })
                .then(data => {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const htmlString = XLSX.utils.sheet_to_html(sheet);
                    document.getElementById('excel-content').innerHTML = htmlString;
                    document.getElementById('modal').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error al cargar el archivo Excel:', error);
                    document.getElementById('excel-content').innerHTML = '<p>Error al cargar el archivo Excel.</p>';
                    document.getElementById('modal').style.display = 'block';
                });
        }
    });
    