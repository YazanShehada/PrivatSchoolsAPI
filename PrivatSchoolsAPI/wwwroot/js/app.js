(function () {
    "use strict";

    // ===================== API client =====================
    const Api = {
        async request(url, options = {}) {
            const res = await fetch(url, options);
            if (!res.ok) {
                throw new Error(res.status === 404 ? "Record not found" : "Request failed (" + res.status + ")");
            }
            if (res.status === 204) return null;
            const text = await res.text();
            return text ? JSON.parse(text) : null;
        },
        json(data) {
            return {
                headers: { "Content-Type": "application/json" },
            };
        },
        getStudents: () => Api.request("/api/Student"),
        createStudent: (formData) => Api.request("/api/Student", { method: "POST", body: formData }),
        updateStudent: (id, formData) => Api.request("/api/Student/" + id, { method: "PUT", body: formData }),
        deleteStudent: (id) => Api.request("/api/Student/" + id, { method: "DELETE", headers: { "Content-Type": "application/json" } }),
        getPayments: () => Api.request("/api/Payment"),
        createPayment: (data) => Api.request("/api/Payment", { method: "POST", headers: Api.json().headers, body: JSON.stringify(data) }),
        updatePayment: (id, data) => Api.request("/api/Payment/" + id, { method: "PUT", headers: Api.json().headers, body: JSON.stringify(data) }),
        deletePayment: (id) => Api.request("/api/Payment/" + id, { method: "DELETE", headers: { "Content-Type": "application/json" } }),
        getAbsences: (studentId) => Api.request("/api/Absence/" + studentId),
        createAbsence: (data) => Api.request("/api/Absence", { method: "POST", headers: Api.json().headers, body: JSON.stringify(data) }),
        updateAbsence: (id, data) => Api.request("/api/Absence/" + id, { method: "PUT", headers: Api.json().headers, body: JSON.stringify(data) }),
        deleteAbsence: (id) => Api.request("/api/Absence/" + id, { method: "DELETE", headers: { "Content-Type": "application/json" } }),
    };

    // ===================== State =====================
    const state = {
        tab: "students",
        students: [],
        payments: [],
        absences: [],
        absenceStudentId: null,
        editingPaymentId: null,
        editingAbsenceId: null,
        confirmAction: null,
    };

    const editIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
    const trashIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

    // ===================== Helpers =====================
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (m) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
        });
    }

    function formatDate(value) {
        if (!value) return "—";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }

    function toDateInput(value) {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
    }

    function toDateTime(value) {
        const d = value ? new Date(value) : new Date();
        return d.toISOString();
    }

    function initials(name) {
        return (name || "?")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(function (w) { return w[0]; })
            .join("")
            .toUpperCase();
    }

    function statusBadge(status) {
        var text = "", cls = "badge-neutral";
        if (status === 1 || status === "Approved") { text = "Approved"; cls = "badge-success"; }
        else if (status === 2 || status === "Pending") { text = "Pending"; cls = "badge-warning"; }
        else if (status === 3 || status === "Rejected") { text = "Rejected"; cls = "badge-danger"; }
        else { text = "—"; cls = "badge-neutral"; }
        return '<span class="badge ' + cls + '">' + text + "</span>";
    }

    function avatarHtml(student, sizeClass) {
        const cls = sizeClass || "";
        if (student.profileImageUrl) {
            return '<img class="avatar ' + cls + '" src="' + esc(student.profileImageUrl) +
                '" alt="' + esc(student.studentName) + '" onerror="this.style.display=\'none\';" />';
        }
        return '<div class="avatar-fallback ' + cls + '">' + esc(initials(student.studentName)) + "</div>";
    }

    function money(value) {
        return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // /api/Student GET returns the raw entity (id, name, ...); map to the DTO shape the UI uses.
    function normalizeStudent(s) {
        return {
            studentId: s.studentId != null ? s.studentId : s.id,
            studentName: s.studentName || s.name || "",
            studentBirthPlace: s.studentBirthPlace || s.birthPlace || "",
            studentBirthDate: s.studentBirthDate || s.birthDate,
            studentAddress: s.studentAddress || s.address || "",
            studentFatherJob: s.studentFatherJob || s.fatherJob || "",
            studentMotherJob: s.studentMotherJob || s.motherJob || "",
            studentPhoneNumber: s.studentPhoneNumber || s.phoneNumber || "",
            studentMotherPhone: s.studentMotherPhone || s.motherPhone || "",
            studentFatherPhone: s.studentFatherPhone || s.fatherPhone || "",
            studentHomePhone: s.studentHomePhone || s.homePhone || "",
            studentGrade9: s.studentGrade9 || s.grade9 || "",
            studentGrade11: s.studentGrade11 || s.grade11 || "",
            profileImageUrl: s.profileImageUrl || "",
            studentStatus: s.studentStatus ?? s.StudentStatus,
        };
    }

    // ===================== Toasts & modals =====================
    function toast(message, type) {
        const box = $("#toasts");
        const t = document.createElement("div");
        t.className = "toast " + (type || "info");
        t.textContent = message;
        box.appendChild(t);
        setTimeout(function () {
            t.style.opacity = "0";
            t.style.transition = "opacity 0.3s";
            setTimeout(function () { t.remove(); }, 300);
        }, 3000);
    }

    function openModal(id) {
        $("#" + id).classList.add("open");
    }

    function closeModal(id) {
        $("#" + id).classList.remove("open");
    }

    function closeAllModals() {
        $$(".modal.open").forEach(function (m) { m.classList.remove("open"); });
    }

    function confirmDialog(message, action) {
        $("#confirm-message").textContent = message;
        state.confirmAction = action;
        openModal("confirm-modal");
    }

    // ===================== Navigation =====================
    function switchTab(tab) {
        state.tab = tab;
        $$(".nav-item").forEach(function (btn) {
            btn.classList.toggle("active", btn.dataset.tab === tab);
        });
        $$(".view").forEach(function (v) {
            v.classList.toggle("active", v.id === "view-" + tab);
        });

        const titles = { students: "Students", payments: "Payments", absences: "Absences" };
        $("#page-title").textContent = titles[tab];
        $("#header-add-btn").textContent = tab === "students"
            ? "+ Add Student"
            : tab === "payments" ? "+ Add Payment" : "+ Add Absence";
        $("#header-add-btn").style.display = tab === "absences" && !state.absenceStudentId ? "none" : "";
    }

    // ===================== Render: stats =====================
    function renderStats() {
        let totalCollected = 0;
        state.payments.forEach(function (p) { totalCollected += Number(p.amount) || 0; });

        $("#stats").innerHTML =
            statCard("Students", state.students.length) +
            statCard("Payments", state.payments.length) +
            statCard("Total Collected", money(totalCollected)) +
            statCard("Absence Records", countAllAbsences());
    }

    function statCard(label, value) {
        return '<div class="stat-card"><div class="stat-value">' + esc(value) +
            '</div><div class="stat-label">' + esc(label) + "</div></div>";
    }

    function countAllAbsences() {
        return state.absences.length;
    }

    // ===================== Students =====================
    function renderStudents() {
        const q = $("#student-search").value.trim().toLowerCase();
        const list = state.students.filter(function (s) {
            const hay = [
                s.studentName, s.studentBirthPlace, s.studentPhoneNumber,
                s.studentFatherPhone, s.studentMotherPhone, s.studentHomePhone,
                s.studentGrade9, s.studentGrade11, s.studentAddress
            ].join(" ").toLowerCase();
            return hay.indexOf(q) !== -1;
        });

        $("#student-count").textContent = list.length + " of " + state.students.length;
        $("#student-empty").style.display = list.length ? "none" : "";
        $("#student-grid").innerHTML = list.map(studentCardHtml).join("");

        $$(".card-grid .btn-view").forEach(function (btn, i) {
            btn.addEventListener("click", function () { showStudentDetail(list[i]); });
        });
        $$(".card-grid .btn-edit").forEach(function (btn, i) {
            btn.addEventListener("click", function () { openStudentModal(list[i]); });
        });
        $$(".card-grid .btn-delete").forEach(function (btn, i) {
            btn.addEventListener("click", function () {
                const s = list[i];
                confirmDialog('Delete student "' + s.studentName + '"? This cannot be undone.', function () {
                    Api.deleteStudent(s.studentId).then(function () {
                        toast("Student deleted");
                        return loadAll();
                    }).catch(function (e) { toast(e.message, "error"); });
                });
            });
        });
    }

    function studentCardHtml(s) {
        return '<div class="student-card">' +
            '<div class="student-card-top">' +
            avatarHtml(s) +
            "<div>" +
            '<div class="student-name">' + esc(s.studentName) + "</div>" +
            '<div class="student-meta">' + esc(s.studentGrade9 || "Grade 9") + " &middot; " + esc(s.studentGrade11 || "") + "</div>" +
            "</div>" +
            "</div>" +
            '<div class="student-info">' +
            '<span><strong>Birth:</strong> ' + formatDate(s.studentBirthDate) + (s.studentBirthPlace ? " (" + esc(s.studentBirthPlace) + ")" : "") + "</span>" +
            '<span><strong>Phone:</strong> ' + esc(s.studentPhoneNumber || "—") + "</span>" +
            '<span><strong>Father:</strong> ' + esc(s.studentFatherPhone || "—") + "</span>" +
            '<span><strong>Mother:</strong> ' + esc(s.studentMotherPhone || "—") + "</span>" +
            "</div>" +
            '<div class="student-status">' + statusBadge(s.studentStatus) + "</div>" +
            '<div class="student-card-actions">' +
            '<button class="btn btn-outline btn-sm btn-view">View</button>' +
            '<button class="btn btn-sm btn-edit">Edit</button>' +
            '<button class="btn btn-danger btn-sm btn-delete">Delete</button>' +
            "</div>" +
            "</div>";
    }

    // ===================== Payments =====================
    function renderPayments() {
        const q = $("#payment-search").value.trim().toLowerCase();
        const list = state.payments.filter(function (p) {
            return (p.studentName || "").toLowerCase().indexOf(q) !== -1;
        });

        $("#payment-count").textContent = list.length + " of " + state.payments.length;
        $("#payment-empty").style.display = list.length ? "none" : "";
        $("#payment-body").innerHTML = list.map(function (p, i) {
            return "<tr>" +
                '<td><div class="cell-student">' +
                '<span class="badge badge-neutral">#' + esc(p.studentId) + "</span>" +
                esc(p.studentName || "—") + "</div></td>" +
                "<td>" + money(p.amount) + "</td>" +
                "<td>" + money(p.totalAmount) + "</td>" +
                "<td>" + formatDate(p.paymentDate) + "</td>" +
                '<td class="col-actions">' +
                '<button class="btn-icon btn-pay-edit" data-i="' + i + '" title="Edit"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>' +
                '<button class="btn-icon danger btn-pay-delete" data-i="' + i + '" title="Delete"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>' +
                "</td>" +
                "</tr>";
        }).join("");

        $$("#payment-body .btn-pay-edit").forEach(function (btn) {
            const p = list[Number(btn.dataset.i)];
            btn.addEventListener("click", function () { openPaymentModal(p); });
        });
        $$("#payment-body .btn-pay-delete").forEach(function (btn) {
            const p = list[Number(btn.dataset.i)];
            btn.addEventListener("click", function () {
                confirmDialog('Delete payment of ' + money(p.amount) + " for " + (p.studentName || "#" + p.studentId) + "?", function () {
                    Api.deletePayment(p.paymentId).then(function () {
                        toast("Payment deleted");
                        return loadAll();
                    }).catch(function (e) { toast(e.message, "error"); });
                });
            });
        });
    }

    // ===================== Absences =====================
    function renderAbsenceStudentSelect(value) {
        const options = state.students.map(function (s) {
            return '<option value="' + s.studentId + '"' + (s.studentId === value ? " selected" : "") + ">" +
                esc(s.studentName) + "</option>";
        }).join("");
        $("#absence-student-select").innerHTML = '<option value="">-- Select a student --</option>' + options;
        $("#absence-student-select").value = value == null ? "" : String(value);
    }

    async function loadAbsencesForStudent(studentId) {
        state.absenceStudentId = studentId;
        renderAbsenceStudentSelect(studentId);
        switchTab("absences");

        if (!studentId) {
            state.absences = [];
            renderAbsences();
            return;
        }
        try {
            const result = await Api.getAbsences(studentId);
            const rows = Array.isArray(result) ? result : (result && result.items ? result.items : []);
            state.absences = rows;
            renderAbsences();
        } catch (e) {
            state.absences = [];
            renderAbsences();
            toast(e.message, "error");
        }
    }

    function renderAbsences() {
        const rows = state.absences.slice().sort(function (a, b) {
            return new Date(b.absenceDate) - new Date(a.absenceDate);
        });

        $("#absence-empty").style.display = rows.length ? "none" : "";
        $("#absence-empty").textContent = state.absenceStudentId ? "No absence records for this student." : "Select a student to view their absence records.";
        $("#absence-body").innerHTML = rows.map(function (a) {
            const present = a.result === true;
            return "<tr>" +
                "<td>" + formatDate(a.absenceDate) + "</td>" +
                '<td><span class="badge ' + (present ? "badge-success" : "badge-danger") + '">' + (present ? "Present" : "Absent") + "</span></td>" +
                '<td class="col-actions">' +
                '<button class="btn-icon btn-ab-edit" data-idx="' + rows.indexOf(a) + '" title="Edit">' + editIcon + "</button>" +
                '<button class="btn-icon danger btn-ab-delete" data-idx="' + rows.indexOf(a) + '" title="Delete">' + trashIcon + "</button>" +
                "</td>" +
                "</tr>";
        }).join("");

        $$("#absence-body .btn-ab-edit").forEach(function (btn) {
            const a = rows[Number(btn.dataset.idx)];
            btn.addEventListener("click", function () { openAbsenceModal(a); });
        });
        $$("#absence-body .btn-ab-delete").forEach(function (btn) {
            const a = rows[Number(btn.dataset.idx)];
            btn.addEventListener("click", function () {
                confirmDialog('Delete absence record for ' + formatDate(a.absenceDate) + "?", function () {
                    Api.deleteAbsence(a.id).then(function () {
                        toast("Record deleted");
                        return loadAbsencesForStudent(state.absenceStudentId);
                    }).catch(function (e) { toast(e.message, "error"); });
                });
            });
        });
    }

    // ===================== Modals: student =====================
    function openStudentModal(student) {
        const isEdit = !!student && student.studentId != null;
        $("#student-modal-title").textContent = isEdit ? "Edit Student" : "Add Student";

        const form = $("#student-form");
        form.reset();
        $("#student-id").value = isEdit ? student.studentId : "";
        $("#student-name").value = isEdit ? student.studentName : "";
        $("#student-birth-place").value = isEdit ? student.studentBirthPlace : "";
        $("#student-birth-date").value = isEdit ? toDateInput(student.studentBirthDate) : "";
        $("#student-address").value = isEdit ? (student.studentAddress || "") : "";
        $("#student-phone").value = isEdit ? (student.studentPhoneNumber || "") : "";
        $("#student-home-phone").value = isEdit ? (student.studentHomePhone || "") : "";
        $("#student-mother-phone").value = isEdit ? (student.studentMotherPhone || "") : "";
        $("#student-father-phone").value = isEdit ? (student.studentFatherPhone || "") : "";
        $("#student-father-job").value = isEdit ? (student.studentFatherJob || "") : "";
        $("#student-mother-job").value = isEdit ? (student.studentMotherJob || "") : "";
        $("#student-grade9").value = isEdit ? (student.studentGrade9 || "") : "";
        $("#student-grade11").value = isEdit ? (student.studentGrade11 || "") : "";
        $("#student-status").value = isEdit ? (student.studentStatus ?? "2") : "2";

        const preview = $("#student-photo-preview");
        $("#student-profile-url").value = isEdit ? (student.profileImageUrl || "") : "";
        if (isEdit && student.profileImageUrl) {
            preview.src = student.profileImageUrl;
            preview.style.display = "";
        } else {
            preview.removeAttribute("src");
            preview.style.display = "none";
        }
        openModal("student-modal");
    }

    async function submitStudent(e) {
        e.preventDefault();
        const id = $("#student-id").value;
        const isEdit = !!id;

        const formData = new FormData();
        formData.append("StudentName", $("#student-name").value.trim());
        formData.append("StudentStatus", $("#student-status").value);
        formData.append("StudentBirthPlace", $("#student-birth-place").value.trim());
        formData.append("StudentBirthDate", toDateTime($("#student-birth-date").value));
        formData.append("StudentAddress", $("#student-address").value.trim());
        formData.append("StudentFatherJob", $("#student-father-job").value.trim());
        formData.append("StudentMotherJob", $("#student-mother-job").value.trim());
        formData.append("StudentPhoneNumber", $("#student-phone").value.trim());
        formData.append("StudentMotherPhone", $("#student-mother-phone").value.trim());
        formData.append("StudentFatherPhone", $("#student-father-phone").value.trim());
        formData.append("StudentHomePhone", $("#student-home-phone").value.trim());
        formData.append("StudentGrade9", $("#student-grade9").value.trim());
        formData.append("StudentGrade11", $("#student-grade11").value.trim());

        // Keep the existing photo unless a new one is uploaded; a new file replaces it.
        if (isEdit) {
            formData.append("profileImageUrl", $("#student-profile-url").value || "");
        }

        const fileInput = $("#student-image-input");
        if (fileInput.files && fileInput.files.length) {
            formData.append("StudentImage", fileInput.files[0]);
        }

        try {
            if (isEdit) {
                await Api.updateStudent(Number(id), formData);
                toast("Student updated");
            } else {
                await Api.createStudent(formData);
                toast("Student added");
            }
            closeModal("student-modal");
            await loadAll();
        } catch (err) {
            toast(err.message, "error");
        }
    }

    // ===================== Student detail =====================
    async function showStudentDetail(student) {
        let studentPayments = state.payments.filter(function (p) { return p.studentId === student.studentId; });
        let absences;
        try {
            const result = await Api.getAbsences(student.studentId);
            absences = Array.isArray(result) ? result : (result && result.items ? result.items : []);
        } catch (e) {
            absences = [];
        }
        const presentCount = absences.filter(function (a) { return a.result; }).length;
        const absentCount = absences.length - presentCount;

        $("#student-detail-body").innerHTML =
            '<div class="detail-head">' +
            avatarHtml(student) +
            "<div>" +
            "<h4>" + esc(student.studentName) + " " + statusBadge(student.studentStatus) + "</h4>" +
            "<p>" + esc(student.studentGrade9 || "") + (student.studentGrade11 ? " &middot; " + esc(student.studentGrade11) : "") + "</p>" +
            "</div>" +
            "</div>" +
            '<dl class="detail-grid">' +
            detailItem("ID", "#" + student.studentId) +
            detailItem("Status", statusBadge(student.studentStatus)) +
            detailItem("Birth Place", student.studentBirthPlace) +
            detailItem("Birth Date", formatDate(student.studentBirthDate)) +
            detailItem("Address", student.studentAddress) +
            detailItem("Phone Number", student.studentPhoneNumber) +
            detailItem("Home Phone", student.studentHomePhone) +
            detailItem("Father Phone", student.studentFatherPhone) +
            detailItem("Mother Phone", student.studentMotherPhone) +
            detailItem("Father Job", student.studentFatherJob) +
            detailItem("Mother Job", student.studentMotherJob) +
            "</dl>" +
            '<div class="detail-section-title">Payments (' + studentPayments.length + ")</div>" +
            (studentPayments.length
                ? "<table class='table'><thead><tr><th>Date</th><th>Amount</th><th>Total</th></tr></thead><tbody>" +
                    studentPayments.map(function (p) {
                        return "<tr><td>" + formatDate(p.paymentDate) + "</td><td>" + money(p.amount) + "</td><td>" + money(p.totalAmount) + "</td></tr>";
                    }).join("") + "</tbody></table>"
                : '<p class="empty" style="padding:16px">No payments yet.</p>') +
            '<div class="detail-section-title">Absences</div>' +
            "<p>" +
            '<span class="badge badge-success">' + presentCount + " Present</span> " +
            '<span class="badge badge-danger">' + absentCount + " Absent</span>" +
            "</p>";

        openModal("student-detail-modal");
    }

    function detailItem(label, value) {
        return '<div class="detail-item"><dt>' + esc(label) + "</dt><dd>" + esc(value || "—") + "</dd></div>";
    }

    // ===================== Modals: payment =====================
    async function openPaymentModal(payment) {
        const isEdit = !!payment && payment.paymentId != null;
        $("#payment-modal-title").textContent = isEdit ? "Edit Payment" : "Add Payment";

        const form = $("#payment-form");
        form.reset();
        $("#payment-id").value = isEdit ? payment.paymentId : "";

        const stuField = $("#payment-student-field");
        const dateField = $("#payment-date-field");
        if (isEdit) {
            stuField.style.display = "none";
            dateField.style.display = "";
            $("#payment-date").value = toDateInput(payment.paymentDate);
        } else {
            stuField.style.display = "";
            dateField.style.display = "none";
            fillStudentSelect($("#payment-student-select"), null);
        }
        $("#payment-amount").value = isEdit ? payment.amount : "";
        $("#payment-total").value = isEdit ? payment.totalAmount : "";

        if (!isEdit) {
            if (!state.students.length) {
                toast("Loading students...", "info");
                try {
                    const students = await Api.getStudents();
                    state.students = (Array.isArray(students) ? students : []).map(normalizeStudent);
                } catch (err) {
                    toast(err.message, "error");
                    return;
                }
            }
            if (!state.students.length) {
                toast("Add a student first", "error");
                return;
            }
        }
        openModal("payment-modal");
    }

    function fillStudentSelect(select, selectedId) {
        select.innerHTML = '<option value="">-- Select a student --</option>' +
            state.students.map(function (s) {
                return '<option value="' + s.studentId + '"' + (s.studentId === selectedId ? " selected" : "") + ">" +
                    esc(s.studentName) + "</option>";
            }).join("");
    }

    async function submitPayment(e) {
        e.preventDefault();
        const id = $("#payment-id").value;
        const isEdit = !!id;

        const studentId = Number($("#payment-student-select").value);
        if (!isEdit && (!studentId || studentId <= 0)) {
            toast("Choose a student", "error");
            return;
        }

        const data = {
            studentId: isEdit ? undefined : studentId,
            amount: Number($("#payment-amount").value),
            totalAmount: Number($("#payment-total").value),
        };

        if (isEdit) {
            data.paymentDate = toDateTime($("#payment-date").value);
        }

        try {
            if (isEdit) {
                await Api.updatePayment(Number(id), data);
                toast("Payment updated");
            } else {
                await Api.createPayment(data);
                toast("Payment added");
            }
            closeModal("payment-modal");
            await loadAll();
        } catch (err) {
            toast(err.message, "error");
        }
    }

    // ===================== Modals: absence =====================
    function openAbsenceModal(absence) {
        const isEdit = !!absence && absence.id != null;
        $("#absence-modal-title").textContent = isEdit ? "Edit Absence Record" : "Add Absence Record";

        const form = $("#absence-form");
        form.reset();
        $("#absence-id").value = isEdit ? absence.id : "";

        const stuField = $("#absence-student-field");
        if (isEdit) {
            stuField.style.display = "none";
            $("#absence-date").value = toDateInput(absence.absenceDate);
            $("#absence-result").value = String(absence.result);
        } else {
            stuField.style.display = "";
            fillStudentSelect($("#absence-form-student-select"), state.absenceStudentId);
            $("#absence-date").value = toDateInput(new Date());
            $("#absence-result").value = "true";
        }

        if (!isEdit && !state.students.length) {
            toast("Add a student first", "error");
            return;
        }
        openModal("absence-modal");
    }

    async function submitAbsence(e) {
        e.preventDefault();
        const id = $("#absence-id").value;
        const isEdit = !!id;

        if (!isEdit && !$("#absence-form-student-select").value) {
            toast("Choose a student", "error");
            return;
        }

        const data = {
            studentId: isEdit ? undefined : Number($("#absence-form-student-select").value),
            result: $("#absence-result").value === "true",
            absenceDate: toDateTime($("#absence-date").value),
        };

        try {
            if (isEdit) {
                await Api.updateAbsence(Number(id), data);
                toast("Record updated");
            } else {
                await Api.createAbsence(data);
                toast("Record added");
            }
            closeModal("absence-modal");
            await loadAbsencesForStudent(state.absenceStudentId);
            await loadAll();
        } catch (err) {
            toast(err.message, "error");
        }
    }

    // ===================== Load all =====================
    async function loadAll() {
        $("#student-empty").style.display = "none";
        $("#payment-empty").style.display = "none";
        try {
            const [students, payments] = await Promise.all([Api.getStudents(), Api.getPayments()]);
            state.students = (Array.isArray(students) ? students : []).map(normalizeStudent);
            state.payments = Array.isArray(payments) ? payments : [];

            if (state.absenceStudentId) {
                try {
                    const result = await Api.getAbsences(state.absenceStudentId);
                    state.absences = Array.isArray(result) ? result : (result && result.items ? result.items : []);
                } catch (e) {
                    state.absences = [];
                }
            }

            renderStats();
            renderStudents();
            renderPayments();
            renderAbsenceStudentSelect(state.absenceStudentId);
            renderAbsences();
            switchTab(state.tab);
        } catch (e) {
            toast(e.message, "error");
        }
    }

    // ===================== Wire up =====================
    function init() {
        $$(".nav-item").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const tab = btn.dataset.tab;
                if (tab === "absences" && !state.absenceStudentId) {
                    loadAbsencesForStudent(null);
                } else {
                    switchTab(tab);
                }
            });
        });

        $("#header-add-btn").addEventListener("click", function () {
            if (state.tab === "students") openStudentModal(null);
            else if (state.tab === "payments") openPaymentModal(null);
            else openAbsenceModal(null);
        });

        $("#student-search").addEventListener("input", renderStudents);
        $("#payment-search").addEventListener("input", renderPayments);

        $("#absence-student-select").addEventListener("change", function () {
            loadAbsencesForStudent(this.value ? Number(this.value) : null);
        });

        $("#student-form").addEventListener("submit", submitStudent);
        $("#payment-form").addEventListener("submit", submitPayment);
        $("#absence-form").addEventListener("submit", submitAbsence);

        $("#student-image-input").addEventListener("change", function () {
            const file = this.files && this.files[0];
            const preview = $("#student-photo-preview");
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                preview.src = ev.target.result;
                preview.style.display = "";
            };
            reader.readAsDataURL(file);
        });

        $("#confirm-btn").addEventListener("click", function () {
            closeModal("confirm-modal");
            if (typeof state.confirmAction === "function") {
                const fn = state.confirmAction;
                state.confirmAction = null;
                fn();
            }
        });

        // Close modals via overlay or data-close
        $$("[data-close]").forEach(function (elm) {
            elm.addEventListener("click", function () {
                const modal = elm.closest(".modal");
                if (modal) modal.classList.remove("open");
            });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeAllModals();
        });

        loadAll();
    }

    document.addEventListener("DOMContentLoaded", init);
})();