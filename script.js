  let items = [];
        let logoData = "";

        document.getElementById('logoUpload').addEventListener('change', function (evt) {
            const reader = new FileReader();
            reader.onload = function (e) {
                logoData = e.target.result;
            };
            reader.readAsDataURL(evt.target.files[0]);
        });

        function addItem() {
            const desc = document.getElementById('desc').value;
            const qty = parseFloat(document.getElementById('qty').value);
            const rate = parseFloat(document.getElementById('rate').value);
            if (!desc || isNaN(qty) || isNaN(rate)) return alert('Please enter valid item details.');
            const total = qty * rate;
            items.push({ desc, qty, rate, total });
            renderTable();
            updateSummary();
        }

        function renderTable() {
            const tbody = document.querySelector('#invoiceTable tbody');
            tbody.innerHTML = '';
            items.forEach(item => {
                const row = `<tr><td>${item.desc}</td><td>${item.qty}</td><td>$${item.rate.toFixed(2)}</td><td>$${item.total.toFixed(2)}</td></tr>`;
                tbody.innerHTML += row;
            });
        }

        function updateSummary() {
            const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
            const cgst = subtotal * 0.09;
            const sgst = subtotal * 0.09;
            const discount = subtotal * 0.05;
            const total = subtotal + cgst + sgst - discount;

            document.getElementById('subtotal').innerText = subtotal.toFixed(2);
            document.getElementById('tax').innerText = (cgst + sgst).toFixed(2);
            document.getElementById('discount').innerText = discount.toFixed(2);
            document.getElementById('total').innerText = total.toFixed(2);
        }

        function generatePreview() {
            document.getElementById('invDate').innerText = new Date().toLocaleDateString();
            const fromCompany = document.getElementById('fromCompany').value || 'Your Company';
            const toCompany = document.getElementById('toCompany').value || 'Client Company';
            document.getElementById('previewFrom').innerText = fromCompany;
            document.getElementById('previewTo').innerText = toCompany;

            const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
            const cgst = subtotal * 0.09;
            const sgst = subtotal * 0.09;
            const discount = subtotal * 0.05;
            const total = subtotal + cgst + sgst - discount;

            document.getElementById('pSubtotal').innerText = subtotal.toFixed(2);
            document.getElementById('pCGST').innerText = cgst.toFixed(2);
            document.getElementById('pSGST').innerText = sgst.toFixed(2);
            document.getElementById('pDiscount').innerText = discount.toFixed(2);
            document.getElementById('pTotal').innerText = total.toFixed(2);

            const previewBody = document.getElementById('previewItems');
            previewBody.innerHTML = '';
            items.forEach(item => {
                const row = `<tr><td>${item.desc}</td><td>${item.qty}</td><td>$${item.rate.toFixed(2)}</td><td>$${item.total.toFixed(2)}</td></tr>`;
                previewBody.innerHTML += row;
            });

            const qrData = document.getElementById('upiLink').value;
            if (qrData) {
                QRCode.toCanvas(document.getElementById("qrCanvas"), qrData);
            }

            const previewLogo = document.getElementById("previewLogo");
            if (logoData) {
                previewLogo.src = logoData;
                previewLogo.style.display = 'block';
            }

            document.getElementById('previewArea').style.display = 'block';
        }

        function generatePDF() {
            const invoiceContent = document.getElementById("invoiceContent");
            html2canvas(invoiceContent, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jspdf.jsPDF("p", "mm", "a4");
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pageWidth;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save("invoice.pdf");
            }).catch(err => {
                alert("Failed to generate PDF. Try again.");
                console.error("PDF Error:", err);
            });
        }