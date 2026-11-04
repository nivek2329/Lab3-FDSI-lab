function valueText(value) {
    return value === null || value === undefined ? '' : String(value);
}
function addCell(row, value, options = {}) {
    const cell = document.createElement('td');
    if (options.style) Object.assign(cell.style, options.style);
    const content = options.tag ? document.createElement(options.tag) : cell;
    if (options.className) content.className = options.className;
    content.textContent = valueText(value);
    if (content !== cell) cell.appendChild(content);
    row.appendChild(cell);
}
function loadAuditLog() {
    const tbody = document.getElementById('auditBody');
    const empty = document.getElementById('emptyMessage');
    const table = document.getElementById('auditTable');
    let entries = [];
    try {
        const parsed = JSON.parse(localStorage.getItem('netops_audit_log') || '[]');
        if (Array.isArray(parsed)) entries = parsed;
    } catch { localStorage.removeItem('netops_audit_log'); }
    tbody.replaceChildren();
    if (!entries.length) { table.style.display = 'none'; empty.style.display = 'block'; return; }
    table.style.display = 'table'; empty.style.display = 'none';
    entries.forEach(entry => {
        const row = document.createElement('tr');
        addCell(row, entry.timestamp, {style: {fontFamily: 'monospace', fontSize: '0.9em', color: '#8b949e'}});
        addCell(row, entry.operator, {tag: 'strong'});
        addCell(row, entry.device, {tag: 'span', className: 'badge badge-active'});
        addCell(row, entry.script, {tag: 'code'});
        addCell(row, entry.status, {tag: 'span', className: 'badge badge-approved'});
        addCell(row, entry.hash, {style: {fontFamily: 'monospace', fontSize: '0.85em', color: '#d29922'}});
        tbody.appendChild(row);
    });
}
function clearAuditLog() {
    if (confirm('¿Está seguro de que desea borrar todo el historial de auditoría?')) {
        localStorage.removeItem('netops_audit_log'); loadAuditLog();
    }
}
document.getElementById('refreshAudit').addEventListener('click', loadAuditLog);
document.getElementById('clearAudit').addEventListener('click', clearAuditLog);
window.addEventListener('DOMContentLoaded', loadAuditLog);
