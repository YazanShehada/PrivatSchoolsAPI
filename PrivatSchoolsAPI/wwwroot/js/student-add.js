(function () {
    "use strict";

    var root = document.getElementById("student-add-page");
    if (!root) return;

    // ===================== API client =====================
    var Api = {
        async: function (url, options) {
            return fetch(url, options || {}).then(function (res) {
                if (res.status === 204) return null;
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("Request failed (" + res.status + ")");
                return res.text().then(function (text) {
                    return text ? JSON.parse(text) : null;
                });
            });
        },
        createStudent: function (formData) {
            return Api.async("/api/Student", { method: "POST", body: formData });
        },
    };

    // ===================== helpers =====================
    var $ = function (sel) { return document.querySelector(sel); };

    function toast(message, type) {
        var box = $("#toasts");
        if (!box) return;
        var t = document.createElement("div");
        t.className = "toast " + (type || "info");
        t.textContent = message;
        box.appendChild(t);
        setTimeout(function () { t.remove(); }, 3000);
    }

    function val(sel) {
        var el = $(sel);
        return el ? el.value.trim() : "";
    }

    // "yyyy-mm-dd" -> ISO date-time expected by the API
    function toIso(value) {
        if (!value) return "";
        var d = new Date(value + "T00:00:00");
        return isNaN(d.getTime()) ? value : d.toISOString();
    }

    function setButtonBusy(busy) {
        var btn = $("#student-submit");
        if (!btn) return;
        btn.disabled = busy;
        btn.innerHTML = busy
            ? '<i class="bi bi-hourglass-split"></i> جارٍ الحفظ…'
            : '<i class="bi bi-check-lg"></i> حفظ الطالب';
    }

    // ===================== submit =====================
    function submit(e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append("StudentName", val("#student-name"));
        
        formData.append("StudentBirthPlace", val("#student-birth-place"));
        formData.append("StudentBirthDate", toIso(val("#student-birth-date")));
        formData.append("StudentAddress", val("#student-address"));
        formData.append("StudentFatherJob", val("#student-father-job"));
        formData.append("StudentMotherJob", val("#student-mother-job"));
        formData.append("StudentPhoneNumber", val("#student-phone"));
        formData.append("StudentMotherPhone", val("#student-mother-phone"));
        formData.append("StudentFatherPhone", val("#student-father-phone"));
        formData.append("StudentHomePhone", val("#student-home-phone"));
        formData.append("StudentGrade9", val("#student-grade9"));
        formData.append("StudentGrade11", val("#student-grade11"));

        var fileInput = $("#student-image-input");
        if (fileInput.files && fileInput.files.length) {
            formData.append("StudentImage", fileInput.files[0]);
        }

        setButtonBusy(true);

        Api.createStudent(formData)
            .then(function () {
                toast("تمت إضافة الطالب بنجاح", "success");
                setTimeout(function () { window.location.href = "/Home/Student"; }, 700);
            })
            .catch(function (err) {
                toast(err.message, "error");
                setButtonBusy(false);
            });
    }

    // ===================== image preview =====================
    function wirePreview() {
        var input = $("#student-image-input");
        var preview = $("#student-photo-preview");
        if (!input || !preview) return;

        input.addEventListener("change", function () {
            var file = this.files && this.files[0];
            if (!file) {
                preview.removeAttribute("src");
                preview.hidden = true;
                return;
            }
            var reader = new FileReader();
            reader.onload = function (ev) {
                preview.src = ev.target.result;
                preview.hidden = false;
            };
            reader.readAsDataURL(file);
        });
    }

    // ===================== init =====================
    function init() {
        var form = $("#student-form");
        if (!form) return;

        form.addEventListener("submit", submit);
        wirePreview();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
