"""
统计相关路由模块
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from log import log
from src.storage_adapter import get_storage_adapter
from src.utils import verify_panel_token

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/usage")
async def get_usage_stats(
    start_date: str = None,
    end_date: str = None,
    filename: str = None,
    model: str = None,
    limit: int = 100,
    token: str = Depends(verify_panel_token),
):
    """
    获取使用统计数据
    """
    try:
        storage_adapter = await get_storage_adapter()

        # 检查后端是否支持get_usage_stats
        if not hasattr(storage_adapter, "get_usage_stats"):
            return JSONResponse(content=[])

        stats = await storage_adapter.get_usage_stats(
            start_date=start_date,
            end_date=end_date,
            filename=filename,
            model=model,
            limit=limit,
        )
        return JSONResponse(content=stats)

    except Exception as e:
        log.error(f"获取使用统计失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))
