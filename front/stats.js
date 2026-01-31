// =====================================================================
// 使用统计相关函数 (Moved from common.js)
// =====================================================================

async function loadUsageStats() {
    const range = document.getElementById('statsDateRange').value;
    const model = document.getElementById('statsModel').value.trim();
    const filename = document.getElementById('statsFilename').value.trim();
    
    // 计算日期范围
    let startDate = '', endDate = '';
    const now = new Date();
    
    if (range === 'today') {
        startDate = formatDate(now);
        endDate = formatDate(now);
    } else if (range === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        startDate = formatDate(yesterday);
        endDate = formatDate(yesterday);
    } else if (range === '7days') {
        const past = new Date(now);
        past.setDate(now.getDate() - 7);
        startDate = formatDate(past);
        endDate = formatDate(now);
    } else if (range === '30days') {
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        startDate = formatDate(past);
        endDate = formatDate(now);
    }
    // 'all' 则不传日期参数

    try {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (model) queryParams.append('model', model);
        if (filename) queryParams.append('filename', filename);
        queryParams.append('limit', '100');

        const response = await fetch(`./stats/usage?${queryParams.toString()}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const stats = await response.json();
            renderStats(stats);
        } else {
            showStatus('获取统计数据失败', 'error');
        }
    } catch (error) {
        showStatus('网络错误: ' + error.message, 'error');
    }
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function renderStats(stats) {
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';

    if (!stats || stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #666;">暂无数据</td></tr>';
        updateStatsSummary([]);
        return;
    }

    updateStatsSummary(stats);

    stats.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e9ecef';
        
        // 成功率计算
        const total = item.call_count;
        const success = item.success_count;
        
        tr.innerHTML = `
            <td style="padding: 12px; color: #666;">${item.date}</td>
            <td style="padding: 12px; font-family: monospace;">${item.credential_filename}</td>
            <td style="padding: 12px;">${item.model}</td>
            <td style="padding: 12px;">${total}</td>
            <td style="padding: 12px;">
                <span style="color: #28a745">${success}</span> / 
                <span style="color: #dc3545">${item.failure_count}</span>
            </td>
            <td style="padding: 12px;">${item.token_count.toLocaleString()}</td>
            <td style="padding: 12px; color: #666; font-size: 12px;">${new Date(item.updated_at * 1000).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStatsSummary(stats) {
    let totalCalls = 0;
    let totalSuccess = 0;
    let totalTokens = 0;

    stats.forEach(item => {
        totalCalls += item.call_count;
        totalSuccess += item.success_count;
        totalTokens += item.token_count;
    });

    const successRate = totalCalls > 0 ? Math.round((totalSuccess / totalCalls) * 100) : 0;

    document.getElementById('statsTotalCalls').textContent = totalCalls.toLocaleString();
    document.getElementById('statsTotalSuccess').textContent = totalSuccess.toLocaleString();
    document.getElementById('statsTotalTokens').textContent = totalTokens.toLocaleString();
    document.getElementById('statsSuccessRate').textContent = successRate + '%';
}
