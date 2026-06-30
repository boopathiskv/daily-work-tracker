/* =====================================================
   Daily Work Follow-Up Tracker
   Pure vanilla JS, client-side, offline.
   In-memory `jsondata` store + AES-GCM encrypted import/export.
   ===================================================== */

(function () {
    'use strict';

    /* ---------- Constants ---------- */
    const VALID_PRIORITIES = ['P1', 'P2', 'P3'];
    const VALID_CATEGORIES = ['Work', 'Personal', 'Other'];
    const VALID_TIMES      = ['30 Min', '1 Hr', '2 Hr', '4 Hr'];
    const VALID_STATUSES   = ['Not Started', 'In Progress', 'Waiting', 'Completed'];
    const PRIORITY_RANK    = { P1: 1, P2: 2, P3: 3 };
    const STATUS_RANK      = { 'Not Started': 1, 'In Progress': 2, 'Waiting': 3, 'Completed': 4 };
    const MAX_TASK_NAME    = 200;
    const MAX_REMARKS      = 1000;

    /* ---------- App state ---------- */
    let jsondata      = [];
    let editingId     = null;
    let pendingImport = null;
    let confirmAction = null;
    let importRawText = null;

    /* ---------- DOM references ---------- */
    const el = {};

    document.addEventListener('DOMContentLoaded', function () {
        cacheElements();
        bindEvents();
        loadTasks();
        renderTasks();
        updateSummary();
    });

    function cacheElements() {
        el.form              = document.getElementById('task-form');
        el.formTitle         = document.getElementById('form-title');
        el.taskIdPreview     = document.getElementById('task-id-preview');
        el.btnSubmit         = document.getElementById('btn-submit');
        el.btnReset          = document.getElementById('btn-reset');
        el.btnOpenAdd        = document.getElementById('btn-open-add');
        el.btnExport         = document.getElementById('btn-export');
        el.btnImport         = document.getElementById('btn-import');
        el.btnClearAll       = document.getElementById('btn-clear-all');
        el.importFile        = document.getElementById('import-file');

        el.btnDataMenu       = document.getElementById('btn-data-menu');
        el.dataMenu          = document.getElementById('data-menu');
        el.dataMenuList      = document.getElementById('data-menu-list');

        el.btnInfo           = document.getElementById('btn-info');
        el.infoModal         = document.getElementById('info-modal');

        el.taskName          = document.getElementById('task-name');
        el.priority          = document.getElementById('task-priority');
        el.category          = document.getElementById('task-category');
        el.startDate         = document.getElementById('task-start-date');
        el.dueDate           = document.getElementById('task-due-date');
        el.estimatedTime     = document.getElementById('task-estimated-time');
        el.actualTime        = document.getElementById('task-actual-time');
        el.status            = document.getElementById('task-status');
        el.completedDate     = document.getElementById('task-completed-date');
        el.remarks           = document.getElementById('task-remarks');

        el.searchInput       = document.getElementById('search-input');
        el.filterPriority    = document.getElementById('filter-priority');
        el.filterCategory    = document.getElementById('filter-category');
        el.filterStatus      = document.getElementById('filter-status');
        el.sortBy            = document.getElementById('sort-by');

        el.tasksBody         = document.getElementById('tasks-body');
        el.emptyState        = document.getElementById('empty-state');

        el.sumTotal          = document.getElementById('summary-total');
        el.sumNotStarted     = document.getElementById('summary-not-started');
        el.sumInProgress     = document.getElementById('summary-in-progress');
        el.sumWaiting        = document.getElementById('summary-waiting');
        el.sumCompleted      = document.getElementById('summary-completed');
        el.sumOverdue        = document.getElementById('summary-overdue');

        el.taskModal         = document.getElementById('task-modal');
        el.exportModal       = document.getElementById('export-modal');
        el.importModal       = document.getElementById('import-modal');
        el.confirmModal      = document.getElementById('confirm-modal');
        el.messageModal      = document.getElementById('message-modal');

        el.exportCount       = document.getElementById('export-count');
        el.exportFilename    = document.getElementById('export-filename');
        el.btnConfirmExport  = document.getElementById('btn-confirm-export');

        el.btnChooseFile     = document.getElementById('btn-choose-file');
        el.importFilenameEl  = document.getElementById('import-filename');
        el.importPreview     = document.getElementById('import-preview');
        el.importCount       = document.getElementById('import-count');
        el.btnConfirmImport  = document.getElementById('btn-confirm-import');

        el.confirmTitle      = document.getElementById('confirm-title');
        el.confirmMessage    = document.getElementById('confirm-message');
        el.btnConfirmOk      = document.getElementById('btn-confirm-ok');

        el.messageHeader     = document.getElementById('message-header');
        el.messageTitle      = document.getElementById('message-title');
        el.messageIcon       = document.getElementById('message-icon');
        el.messageText       = document.getElementById('message-text');

        // Encryption UI - Export
        el.exportEncryptToggle    = document.getElementById('export-encrypt-toggle');
        el.exportPasswordWrap     = document.getElementById('export-password-wrap');
        el.exportPassword         = document.getElementById('export-password');
        el.exportPasswordConfirm  = document.getElementById('export-password-confirm');
        el.exportToggleVisibility = document.getElementById('export-toggle-visibility');
        el.exportPwdBar           = document.getElementById('export-pwd-bar');
        el.exportPwdLabel         = document.getElementById('export-pwd-label');
        el.exportPwdWrapper       = el.exportPwdBar ? el.exportPwdBar.parentElement.parentElement : null;

        // Encryption UI - Import
        el.importEncryptedBanner  = document.getElementById('import-encrypted-banner');
        el.importPasswordWrap     = document.getElementById('import-password-wrap');
        el.importPassword         = document.getElementById('import-password');
        el.importToggleVisibility = document.getElementById('import-toggle-visibility');
        el.btnDecrypt             = document.getElementById('btn-decrypt');
    }

    function bindEvents() {
        el.form.addEventListener('submit', onFormSubmit);
        el.btnReset.addEventListener('click', resetForm);

        el.btnOpenAdd.addEventListener('click', function () {
            resetForm();
            openModal(el.taskModal);
            setTimeout(function () { el.taskName.focus(); }, 50);
        });

        el.btnInfo.addEventListener('click', function () { openModal(el.infoModal); });

        el.startDate.addEventListener('change', updateTaskIdPreview);
        el.startDate.addEventListener('input', updateTaskIdPreview);

        el.btnDataMenu.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDataMenu();
        });
        document.addEventListener('click', function (e) {
            if (!el.dataMenu.contains(e.target)) closeDataMenu();
        });

        // Export / Import / Clear
        el.btnExport.addEventListener('click', function () { closeDataMenu(); openExportModal(); });
        el.btnConfirmExport.addEventListener('click', performExport);

        el.btnImport.addEventListener('click', function () { closeDataMenu(); openImportModal(); });
        el.btnChooseFile.addEventListener('click', function () { el.importFile.click(); });
        el.importFile.addEventListener('change', handleImportFile);

        /* ⭐ The fix: ensure btn-confirm-import is wired up */
        el.btnConfirmImport.addEventListener('click', performImport);

        el.btnClearAll.addEventListener('click', function () { closeDataMenu(); confirmClearAll(); });

        // Filters / search / sort
        el.searchInput.addEventListener('input', renderTasks);
        el.filterPriority.addEventListener('change', renderTasks);
        el.filterCategory.addEventListener('change', renderTasks);
        el.filterStatus.addEventListener('change', renderTasks);
        el.sortBy.addEventListener('change', renderTasks);

        // Table delegated actions
        el.tasksBody.addEventListener('click', onTableClick);

        // Generic modal close
        document.addEventListener('click', function (e) {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            const id = target.getAttribute('data-modal-close');
            if (id) {
                const modal = document.getElementById(id);
                if (modal) closeModal(modal);
            }
        });

        // Confirmation OK
        el.btnConfirmOk.addEventListener('click', function () {
            const action = confirmAction;
            closeModal(el.confirmModal);
            confirmAction = null;
            if (typeof action === 'function') action();
        });

        // ESC closes top-most modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal:not([hidden])');
                if (openModals.length > 0) {
                    closeModal(openModals[openModals.length - 1]);
                } else {
                    closeDataMenu();
                }
            }
        });

        // Warn before leaving
        window.addEventListener('beforeunload', function (e) {
            if (jsondata.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // ---------- Encryption-related ----------
        el.exportEncryptToggle.addEventListener('change', function () {
            el.exportPasswordWrap.hidden = !el.exportEncryptToggle.checked;
            if (!el.exportEncryptToggle.checked) {
                el.exportPassword.value = '';
                el.exportPasswordConfirm.value = '';
                updateExportStrength();
            }
        });
        el.exportPassword.addEventListener('input', updateExportStrength);
        el.exportToggleVisibility.addEventListener('click', function () {
            togglePasswordVisibility(el.exportPassword, el.exportToggleVisibility);
            togglePasswordVisibility(el.exportPasswordConfirm, null);
        });
        el.importToggleVisibility.addEventListener('click', function () {
            togglePasswordVisibility(el.importPassword, el.importToggleVisibility);
        });
        el.btnDecrypt.addEventListener('click', performDecrypt);
        el.importPassword.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); performDecrypt(); }
        });
    }

    /* ===== Dropdown ===== */
    function toggleDataMenu() {
        if (el.dataMenuList.hidden) openDataMenu();
        else                        closeDataMenu();
    }
    function openDataMenu() {
        el.dataMenuList.hidden = false;
        el.btnDataMenu.setAttribute('aria-expanded', 'true');
    }
    function closeDataMenu() {
        el.dataMenuList.hidden = true;
        el.btnDataMenu.setAttribute('aria-expanded', 'false');
    }

    /* ===== Modal helpers ===== */
    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        document.body.classList.add('modal-open');
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.hidden = true;
        if (document.querySelectorAll('.modal:not([hidden])').length === 0) {
            document.body.classList.remove('modal-open');
        }
    }
    function openConfirm(title, message, onOk, okLabel, okClass) {
        el.confirmTitle.textContent   = title || 'Confirm';
        el.confirmMessage.textContent = message || 'Are you sure?';
        el.btnConfirmOk.textContent   = okLabel || 'Confirm';
        el.btnConfirmOk.className     = 'btn ' + (okClass || 'btn-danger');
        confirmAction = onOk;
        openModal(el.confirmModal);
    }

    /* ===== Message popup ===== */
    function showMessage(message, type) {
        const t = type || 'info';
        const titles = { success: 'Success', error: 'Error', info: 'Information', warning: 'Warning' };
        const icons  = { success: '\u2713', error: '!', info: 'i', warning: '!' };
        el.messageTitle.textContent = titles[t] || 'Message';
        el.messageText.textContent  = String(message || '');
        el.messageIcon.textContent  = icons[t] || 'i';
        el.messageHeader.className  = 'modal-header msg-' + t;
        el.messageIcon.className    = 'message-icon msg-' + t;
        openModal(el.messageModal);
    }

    /* ===== Data store ===== */
    function loadTasks() { jsondata = []; }
    function saveTasks() { return; }

    /* ===== Date helpers ===== */
    function formatDate(isoDate) {
        if (!isoDate || typeof isoDate !== 'string') return '';
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
        if (!m) return '';
        return m[3] + '-' + m[2] + '-' + m[1];
    }
    function parseDate(displayDate) {
        if (!displayDate || typeof displayDate !== 'string') return '';
        const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(displayDate);
        if (!m) return '';
        return m[3] + '-' + m[2] + '-' + m[1];
    }
    function todayISO() {
        const d = new Date();
        return d.getFullYear() + '-' +
               String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0');
    }
    function isOverdue(task) {
        if (!task.dueDate || task.status === 'Completed') return false;
        return task.dueDate < todayISO();
    }

    /* ===== Auto Task ID ===== */
    function generateTaskId(startDateIso) {
        if (!isValidISODate(startDateIso)) return NaN;
        const base = startDateIso.replace(/-/g, '');
        let maxSeq = 0;
        jsondata.forEach(function (t) {
            const idStr = String(t.id);
            if (idStr.length === base.length + 2 && idStr.indexOf(base) === 0) {
                const seq = parseInt(idStr.substring(base.length), 10);
                if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
            }
        });
        if (maxSeq >= 99) return NaN;
        return parseInt(base + String(maxSeq + 1).padStart(2, '0'), 10);
    }
    function updateTaskIdPreview() {
        if (editingId !== null) return;
        const sd = el.startDate.value;
        if (!isValidISODate(sd)) {
            el.taskIdPreview.textContent = 'Auto-generated from Start Date';
            return;
        }
        const id = generateTaskId(sd);
        el.taskIdPreview.textContent = Number.isFinite(id)
            ? String(id)
            : 'Limit reached for this date (max 99)';
    }

    /* ===== Validation / Sanitization ===== */
    function sanitizeText(value, maxLen) {
        if (value === null || value === undefined) return '';
        let s = String(value).trim();
        if (typeof maxLen === 'number' && s.length > maxLen) s = s.substring(0, maxLen);
        return s;
    }
    function isValidISODate(s) {
        if (typeof s !== 'string') return false;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
        const d = new Date(s);
        return !isNaN(d.getTime());
    }
    function isValidTaskObject(t) {
        if (!t || typeof t !== 'object') return false;
        if (typeof t.id !== 'number' || !Number.isFinite(t.id) || t.id <= 0) return false;
        if (typeof t.name !== 'string' || t.name.trim() === '') return false;
        if (VALID_PRIORITIES.indexOf(t.priority) === -1) return false;
        if (VALID_CATEGORIES.indexOf(t.category) === -1) return false;
        if (!isValidISODate(t.startDate)) return false;
        if (!isValidISODate(t.dueDate)) return false;
        if (VALID_TIMES.indexOf(t.estimatedTime) === -1) return false;
        if (t.actualTime && VALID_TIMES.indexOf(t.actualTime) === -1) return false;
        if (VALID_STATUSES.indexOf(t.status) === -1) return false;
        if (t.completedDate && !isValidISODate(t.completedDate)) return false;
        if (t.status === 'Completed' && !isValidISODate(t.completedDate)) return false;
        if (t.dueDate < t.startDate) return false;
        return true;
    }
    function validateTask(task, options) {
        const errors = [];
        options = options || {};
        if (!Number.isFinite(task.id) || task.id <= 0) {
            errors.push('Task ID could not be generated. Please check Start Date.');
        } else {
            const exists = jsondata.some(function (t) {
                return t.id === task.id && t.id !== options.ignoreId;
            });
            if (exists) errors.push('Generated Task ID conflicts with an existing task (' + task.id + ').');
        }
        if (!task.name)          errors.push('Task Name is required.');
        if (!task.priority)      errors.push('Priority is required.');
        if (!task.category)      errors.push('Category is required.');
        if (!task.startDate)     errors.push('Start Date is required.');
        if (!task.dueDate)       errors.push('Due Date is required.');
        if (!task.estimatedTime) errors.push('Estimated Time is required.');
        if (!task.status)        errors.push('Status is required.');

        if (task.priority      && VALID_PRIORITIES.indexOf(task.priority) === -1) errors.push('Invalid Priority value.');
        if (task.category      && VALID_CATEGORIES.indexOf(task.category) === -1) errors.push('Invalid Category value.');
        if (task.estimatedTime && VALID_TIMES.indexOf(task.estimatedTime) === -1) errors.push('Invalid Estimated Time value.');
        if (task.actualTime    && VALID_TIMES.indexOf(task.actualTime) === -1)    errors.push('Invalid Actual Time value.');
        if (task.status        && VALID_STATUSES.indexOf(task.status) === -1)     errors.push('Invalid Status value.');

        if (task.startDate && !isValidISODate(task.startDate)) errors.push('Invalid Start Date.');
        if (task.dueDate   && !isValidISODate(task.dueDate))   errors.push('Invalid Due Date.');
        if (task.startDate && task.dueDate && task.dueDate < task.startDate) {
            errors.push('Due Date cannot be earlier than Start Date.');
        }
        if (task.status === 'Completed') {
            if (!task.completedDate) errors.push('Completed Date is required when Status is Completed.');
            else if (!isValidISODate(task.completedDate)) errors.push('Invalid Completed Date.');
        }
        return errors;
    }

    /* ===== Form helpers ===== */
    function readFormTask(idToUse) {
        return {
            id:            idToUse,
            name:          sanitizeText(el.taskName.value, MAX_TASK_NAME),
            priority:      sanitizeText(el.priority.value, 10),
            category:      sanitizeText(el.category.value, 20),
            startDate:     sanitizeText(el.startDate.value, 10),
            dueDate:       sanitizeText(el.dueDate.value, 10),
            estimatedTime: sanitizeText(el.estimatedTime.value, 10),
            actualTime:    sanitizeText(el.actualTime.value, 10),
            status:        sanitizeText(el.status.value, 20),
            completedDate: sanitizeText(el.completedDate.value, 10),
            remarks:       sanitizeText(el.remarks.value, MAX_REMARKS)
        };
    }
    function fillForm(task) {
        el.taskName.value      = task.name || '';
        el.priority.value      = task.priority || '';
        el.category.value      = task.category || '';
        el.startDate.value     = task.startDate || '';
        el.dueDate.value       = task.dueDate || '';
        el.estimatedTime.value = task.estimatedTime || '';
        el.actualTime.value    = task.actualTime || '';
        el.status.value        = task.status || '';
        el.completedDate.value = task.completedDate || '';
        el.remarks.value       = task.remarks || '';
    }
    function resetForm() {
        el.form.reset();
        editingId                    = null;
        el.formTitle.textContent     = 'Add New Task';
        el.btnSubmit.textContent     = 'Add Task';
        el.taskIdPreview.textContent = 'Auto-generated from Start Date';
    }

    /* ===== Handlers ===== */
    function onFormSubmit(event) {
        event.preventDefault();
        if (editingId === null) addTask();
        else                    updateTask();
    }
    function onTableClick(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        const idStr  = target.getAttribute('data-id');
        if (!action || !idStr) return;
        const id = parseInt(idStr, 10);
        if (!Number.isFinite(id)) return;
        if (action === 'edit')   editTask(id);
        if (action === 'delete') confirmDeleteTask(id);
    }

    /* ===== CRUD ===== */
    function addTask() {
        const startDate = sanitizeText(el.startDate.value, 10);
        if (!isValidISODate(startDate)) {
            showMessage('Please select a valid Start Date to auto-generate the Task ID.', 'error');
            return;
        }
        const newId = generateTaskId(startDate);
        if (!Number.isFinite(newId)) {
            showMessage('Cannot generate Task ID: maximum of 99 tasks per start date reached.', 'error');
            return;
        }
        const task   = readFormTask(newId);
        const errors = validateTask(task);
        if (errors.length > 0) { showMessage(errors[0], 'error'); return; }

        jsondata.push(task);
        saveTasks();
        renderTasks();
        updateSummary();
        resetForm();
        closeModal(el.taskModal);
        showMessage('Task #' + newId + ' added successfully.', 'success');
    }
    function updateTask() {
        const task   = readFormTask(editingId);
        const errors = validateTask(task, { ignoreId: editingId });
        if (errors.length > 0) { showMessage(errors[0], 'error'); return; }
        const idx = jsondata.findIndex(function (t) { return t.id === editingId; });
        if (idx === -1) {
            showMessage('Task no longer exists.', 'error');
            resetForm();
            closeModal(el.taskModal);
            return;
        }
        jsondata[idx] = task;
        saveTasks();
        renderTasks();
        updateSummary();
        resetForm();
        closeModal(el.taskModal);
        showMessage('Task #' + editingId + ' updated successfully.', 'success');
    }
    function editTask(id) {
        const task = jsondata.find(function (t) { return t.id === id; });
        if (!task) { showMessage('Task not found.', 'error'); return; }
        editingId                    = id;
        fillForm(task);
        el.formTitle.textContent     = 'Edit Task #' + id;
        el.btnSubmit.textContent     = 'Update Task';
        el.taskIdPreview.textContent = String(id);
        openModal(el.taskModal);
    }
    function confirmDeleteTask(id) {
        openConfirm(
            'Delete Task',
            'Are you sure you want to delete Task #' + id + '? This action cannot be undone.',
            function () { performDelete(id); },
            'Delete', 'btn-danger'
        );
    }
    function performDelete(id) {
        jsondata = jsondata.filter(function (t) { return t.id !== id; });
        saveTasks();
        if (editingId === id) { resetForm(); closeModal(el.taskModal); }
        renderTasks();
        updateSummary();
        showMessage('Task #' + id + ' deleted.', 'success');
    }
    function confirmClearAll() {
        if (jsondata.length === 0) {
            showMessage('There are no tasks to clear.', 'info');
            return;
        }
        openConfirm(
            'Clear All Tasks',
            'This will permanently delete ALL ' + jsondata.length + ' task(s). Continue?',
            function () {
                jsondata = [];
                saveTasks();
                resetForm();
                renderTasks();
                updateSummary();
                showMessage('All tasks have been cleared.', 'success');
            },
            'Clear All', 'btn-danger'
        );
    }

    /* ===== Filtering / Sorting / Rendering ===== */
    function getFilteredSortedTasks() {
        const search    = el.searchInput.value.trim().toLowerCase();
        const fPriority = el.filterPriority.value;
        const fCategory = el.filterCategory.value;
        const fStatus   = el.filterStatus.value;
        const sortKey   = el.sortBy.value;

        let result = jsondata.slice();
        if (search) {
            result = result.filter(function (t) {
                const haystack = [
                    String(t.id), t.name, t.priority, t.category, t.status, t.remarks || ''
                ].join(' ').toLowerCase();
                return haystack.indexOf(search) !== -1;
            });
        }
        if (fPriority) result = result.filter(function (t) { return t.priority === fPriority; });
        if (fCategory) result = result.filter(function (t) { return t.category === fCategory; });
        if (fStatus) {
            if (fStatus === 'Overdue') result = result.filter(isOverdue);
            else                       result = result.filter(function (t) { return t.status === fStatus; });
        }
        result.sort(function (a, b) {
            switch (sortKey) {
                case 'dueDate':  return (a.dueDate || '').localeCompare(b.dueDate || '');
                case 'priority': return (PRIORITY_RANK[a.priority] || 99) - (PRIORITY_RANK[b.priority] || 99);
                case 'status':   return (STATUS_RANK[a.status] || 99) - (STATUS_RANK[b.status] || 99);
                case 'id':
                default:         return a.id - b.id;
            }
        });
        return result;
    }
    function renderTasks() {
        const list = getFilteredSortedTasks();
        while (el.tasksBody.firstChild) el.tasksBody.removeChild(el.tasksBody.firstChild);
        if (list.length === 0) { el.emptyState.hidden = false; return; }
        el.emptyState.hidden = true;
        const frag = document.createDocumentFragment();
        list.forEach(function (task) { frag.appendChild(buildTaskRow(task)); });
        el.tasksBody.appendChild(frag);
    }
    function buildTaskRow(task) {
        const tr = document.createElement('tr');
        if (isOverdue(task)) tr.classList.add('row-overdue');

        tr.appendChild(makeCell(String(task.id)));
        tr.appendChild(makeCell(task.name));

        const tdPriority = document.createElement('td');
        const spanPrio   = document.createElement('span');
        spanPrio.className   = 'priority priority-' + task.priority;
        spanPrio.textContent = task.priority;
        tdPriority.appendChild(spanPrio);
        tr.appendChild(tdPriority);

        tr.appendChild(makeCell(task.category));
        tr.appendChild(makeCell(formatDate(task.startDate)));
        tr.appendChild(makeCell(formatDate(task.dueDate)));
        tr.appendChild(makeCell(task.estimatedTime || ''));
        tr.appendChild(makeCell(task.actualTime || ''));

        const tdStatus    = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className   = 'badge ' + statusBadgeClass(task.status);
        statusBadge.textContent = task.status;
        tdStatus.appendChild(statusBadge);
        if (isOverdue(task)) {
            const overdue = document.createElement('span');
            overdue.className   = 'badge badge-overdue';
            overdue.textContent = 'Overdue';
            tdStatus.appendChild(overdue);
        }
        tr.appendChild(tdStatus);

        tr.appendChild(makeCell(formatDate(task.completedDate)));
        tr.appendChild(makeCell(task.remarks || ''));

        const tdActions = document.createElement('td');
        const editBtn   = document.createElement('button');
        editBtn.type        = 'button';
        editBtn.className   = 'btn btn-secondary btn-small';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.setAttribute('data-id', String(task.id));

        const delBtn = document.createElement('button');
        delBtn.type        = 'button';
        delBtn.className   = 'btn btn-danger btn-small';
        delBtn.textContent = 'Delete';
        delBtn.setAttribute('data-action', 'delete');
        delBtn.setAttribute('data-id', String(task.id));

        const wrap = document.createElement('div');
        wrap.className = 'row-actions';
        wrap.appendChild(editBtn);
        wrap.appendChild(delBtn);
        tdActions.appendChild(wrap);
        tr.appendChild(tdActions);
        return tr;
    }
    function makeCell(text) {
        const td = document.createElement('td');
        td.textContent = text;
        return td;
    }
    function statusBadgeClass(status) {
        switch (status) {
            case 'Not Started': return 'badge-not-started';
            case 'In Progress': return 'badge-in-progress';
            case 'Waiting':     return 'badge-waiting';
            case 'Completed':   return 'badge-completed';
            default:            return 'badge-not-started';
        }
    }

    function updateSummary() {
        let total = jsondata.length;
        let notStarted = 0, inProgress = 0, waiting = 0, completed = 0, overdue = 0;
        jsondata.forEach(function (t) {
            if (t.status === 'Not Started')      notStarted++;
            else if (t.status === 'In Progress') inProgress++;
            else if (t.status === 'Waiting')     waiting++;
            else if (t.status === 'Completed')   completed++;
            if (isOverdue(t)) overdue++;
        });
        el.sumTotal.textContent      = String(total);
        el.sumNotStarted.textContent = String(notStarted);
        el.sumInProgress.textContent = String(inProgress);
        el.sumWaiting.textContent    = String(waiting);
        el.sumCompleted.textContent  = String(completed);
        el.sumOverdue.textContent    = String(overdue);
    }

    /* =====================================================
       Encryption UI helpers
       ===================================================== */
    function togglePasswordVisibility(inputEl, btn) {
        if (!inputEl) return;
        const isPwd = inputEl.type === 'password';
        inputEl.type = isPwd ? 'text' : 'password';
        if (btn) btn.textContent = isPwd ? '🙈' : '👁';
    }
    function updateExportStrength() {
        if (!el.exportPwdWrapper) return;
        const pwd    = el.exportPassword.value;
        const score  = window.DWTCrypto ? window.DWTCrypto.passwordStrength(pwd) : 0;
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        el.exportPwdWrapper.className = 'pwd-strength' + (score > 0 ? ' s' + score : '');
        el.exportPwdLabel.textContent = pwd ? (labels[score] || 'Weak') : 'Strength';
    }

    /* =====================================================
       Export
       ===================================================== */
    function openExportModal() {
        if (jsondata.length === 0) {
            showMessage('There are no tasks to export.', 'info');
            return;
        }
        el.exportEncryptToggle.checked = false;
        el.exportPasswordWrap.hidden   = true;
        el.exportPassword.value        = '';
        el.exportPasswordConfirm.value = '';
        updateExportStrength();

        el.exportCount.textContent    = String(jsondata.length);
        el.exportFilename.textContent = 'daily-work-tasks-' + todayISO() + '.json';
        openModal(el.exportModal);
    }

    async function performExport() {
        try {
            const useEncryption = el.exportEncryptToggle.checked;
            let outputText;
            let filename = 'daily-work-tasks-' + todayISO() + '.json';

            const json = JSON.stringify(jsondata, null, 2);

            if (useEncryption) {
                const pwd1 = el.exportPassword.value;
                const pwd2 = el.exportPasswordConfirm.value;
                if (!pwd1)              { showMessage('Please enter an encryption password.', 'error'); return; }
                if (pwd1.length < 6)    { showMessage('Password must be at least 6 characters.', 'error'); return; }
                if (pwd1 !== pwd2)      { showMessage('Passwords do not match.', 'error'); return; }
                if (!window.DWTCrypto)  { showMessage('Encryption module not loaded.', 'error'); return; }

                outputText = await window.DWTCrypto.encryptText(json, pwd1);
                filename   = 'daily-work-tasks-' + todayISO() + '.enc.json';
            } else {
                outputText = json;
            }

            const blob = new Blob([outputText], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            closeModal(el.exportModal);
            showMessage(
                useEncryption
                    ? 'Tasks exported & encrypted successfully.'
                    : 'Tasks exported successfully.',
                'success'
            );
        } catch (err) {
            const msg = (err && err.message) ? err.message : 'Failed to export tasks.';
            showMessage('Export failed: ' + msg, 'error');
        }
    }

    /* =====================================================
       Import
       ===================================================== */
    function openImportModal() {
        pendingImport                       = null;
        importRawText                       = null;
        el.importFile.value                 = '';
        el.importFilenameEl.textContent     = 'No file selected';
        el.importFilenameEl.classList.remove('has-file');
        el.importPreview.hidden             = true;
        el.importCount.textContent          = '0';
        el.btnConfirmImport.disabled        = true;
        el.importEncryptedBanner.hidden     = true;
        el.importPasswordWrap.hidden        = true;
        el.importPassword.value             = '';
        openModal(el.importModal);
    }

    function handleImportFile(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showMessage('Import file is too large (max 5MB).', 'error');
            return;
        }
        el.importFilenameEl.textContent = file.name;
        el.importFilenameEl.classList.add('has-file');

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            importRawText = text;

            if (window.DWTCrypto && window.DWTCrypto.isEncryptedEnvelope(text)) {
                el.importEncryptedBanner.hidden = false;
                el.importPasswordWrap.hidden    = false;
                el.importPreview.hidden         = true;
                el.btnConfirmImport.disabled    = true;
                el.importPassword.focus();
            } else {
                el.importEncryptedBanner.hidden = true;
                el.importPasswordWrap.hidden    = true;
                processImportPlaintext(text);
            }
        };
        reader.onerror = function () {
            showMessage('Could not read the selected file.', 'error');
        };
        reader.readAsText(file);
    }

    async function performDecrypt() {
        if (!importRawText) {
            showMessage('Please choose a file first.', 'error');
            return;
        }
        const pwd = el.importPassword.value;
        if (!pwd) { showMessage('Please enter the decryption password.', 'error'); return; }
        if (!window.DWTCrypto) { showMessage('Encryption module not loaded.', 'error'); return; }

        try {
            const plaintext = await window.DWTCrypto.decryptText(importRawText, pwd);
            el.importEncryptedBanner.hidden = true;
            el.importPasswordWrap.hidden    = true;
            el.importPassword.value         = '';
            processImportPlaintext(plaintext);
            showMessage('File decrypted successfully.', 'success');
        } catch (err) {
            const msg = (err && err.message) ? err.message : 'Decryption failed.';
            showMessage(msg, 'error');
        }
    }

    function processImportPlaintext(text) {
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error('Imported data must be a JSON array of tasks.');

            const cleaned = [];
            const seenIds = new Set();
            for (let i = 0; i < parsed.length; i++) {
                const raw = parsed[i];
                if (!raw || typeof raw !== 'object') continue;
                const task = {
                    id:            Number(raw.id),
                    name:          sanitizeText(raw.name, MAX_TASK_NAME),
                    priority:      sanitizeText(raw.priority, 10),
                    category:      sanitizeText(raw.category, 20),
                    startDate:     sanitizeText(raw.startDate, 10),
                    dueDate:       sanitizeText(raw.dueDate, 10),
                    estimatedTime: sanitizeText(raw.estimatedTime, 10),
                    actualTime:    sanitizeText(raw.actualTime, 10),
                    status:        sanitizeText(raw.status, 20),
                    completedDate: sanitizeText(raw.completedDate, 10),
                    remarks:       sanitizeText(raw.remarks, MAX_REMARKS)
                };
                if (!isValidTaskObject(task)) continue;
                if (seenIds.has(task.id))    continue;
                seenIds.add(task.id);
                cleaned.push(task);
            }
            if (cleaned.length === 0) throw new Error('No valid tasks were found in the file.');

            pendingImport                = cleaned;
            el.importCount.textContent   = String(cleaned.length);
            el.importPreview.hidden      = false;
            el.btnConfirmImport.disabled = false;
        } catch (err) {
            pendingImport                = null;
            el.importPreview.hidden      = true;
            el.btnConfirmImport.disabled = true;
            const msg = (err && err.message) ? err.message : 'Invalid JSON file.';
            showMessage('Import failed: ' + msg, 'error');
        }
    }

    function performImport() {
        if (!pendingImport || pendingImport.length === 0) {
            showMessage('No valid tasks ready to import. Please choose a file (and decrypt it if needed).', 'error');
            return;
        }
        const count   = pendingImport.length;
        jsondata      = pendingImport;
        pendingImport = null;
        saveTasks();
        renderTasks();
        updateSummary();
        resetForm();
        closeModal(el.importModal);
        showMessage('Imported ' + count + ' task(s) successfully.', 'success');
    }

})();
