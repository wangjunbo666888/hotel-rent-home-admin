/**
 * 房间详情页脚本
 * 负责加载并渲染房间详细信息
 */
$(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    if (!roomId) {
        $('#roomDetailContainer').html('<div class="alert alert-danger">未指定房间ID</div>');
        return;
    }
    try {
        const room = await roomApi.getDetail(roomId);
        renderRoomDetail(room);
    } catch (e) {
        $('#roomDetailContainer').html('<div class="alert alert-danger">加载房间详情失败</div>');
    }
});

/**
 * 渲染房间详情
 * @param {Object} room 房间对象
 */
function renderRoomDetail(room) {
    if (!room) {
        $('#roomDetailContainer').html('<div class="alert alert-warning">未找到房间信息</div>');
        return;
    }
    let imagesHtml = '';
    if (room.images) {
        const urls = room.images.split(',').filter(Boolean);
        imagesHtml = urls.map(url => `<img src="${url}" class="img-thumbnail me-2 mb-2" style="max-width:180px;max-height:120px;">`).join('');
    }
    let videoHtml = '';
    if (room.videoUrl) {
        videoHtml = `<video src="${room.videoUrl}" controls style="max-width:320px;max-height:180px;" class="me-2 mb-2"></video>`;
    }
    let facilitiesHtml = '';
    if (room.facilities && Array.isArray(room.facilities)) {
        facilitiesHtml = room.facilities.map(f => `<span class="badge bg-info text-dark me-1 mb-1">${f}</span>`).join('');
    }
    const html = `
        <div class="card">
            <div class="card-header">
                <h2>房间号：${room.roomNumber}</h2>
                <div class="text-muted">ID: ${room.id}</div>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <strong>图片：</strong><br>${imagesHtml || '<span class="text-muted">无</span>'}
                </div>
                <div class="mb-3">
                    <strong>视频：</strong><br>${videoHtml || '<span class="text-muted">无</span>'}
                </div>
                <div class="row mb-3">
                    <div class="col-md-4"><strong>所属公寓：</strong> ${room.apartmentId || '-'}</div>
                    <div class="col-md-4"><strong>楼层：</strong> ${room.floor || '-'}</div>
                    <div class="col-md-4"><strong>面积：</strong> ${room.area || '-'} ㎡</div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4"><strong>月租金：</strong> ¥${room.price || '-'}</div>
                    <div class="col-md-4"><strong>押金：</strong> ¥${room.deposit || '-'}</div>
                    <div class="col-md-4"><strong>状态：</strong> ${getStatusText(room.status)}</div>
                </div>
                <div class="mb-3">
                    <strong>配套设施：</strong> ${facilitiesHtml || '<span class="text-muted">无</span>'}
                </div>
                <div class="mb-3">
                    <strong>描述：</strong><br>${room.description || '<span class="text-muted">无</span>'}
                </div>
            </div>
        </div>
    `;
    $('#roomDetailContainer').html(html);
}

/**
 * 获取房间状态文本
 * @param {number} status 状态码
 * @returns {string}
 */
function getStatusText(status) {
    switch (status) {
        case 1: return '<span class="badge bg-success">可租</span>';
        case 0: return '<span class="badge bg-secondary">已租</span>';
        case 2: return '<span class="badge bg-warning text-dark">维护</span>';
        default: return '<span class="badge bg-light text-dark">未知</span>';
    }
} 