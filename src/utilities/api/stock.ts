import { API_BASE } from '../constants';

interface StockDeductionItem {
  drug_id: string;
  deducted_quantity: number;
  deduction_unit: 'box' | 'strip' | 'tablet';
}

interface StockDeductionPayload {
  deductions: StockDeductionItem[];
}

export async function deductDrugStock(payload: StockDeductionPayload) {
  const res = await fetch(`${API_BASE}/drugs/deduct-stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail: any = null;
    try {
      detail = await res.json();
    } catch (e) {
      console.error('Failed to parse error response:', e);
    }
    const err = new Error(`API ${res.status} - Failed to deduct stock`) as any;
    err.status = res.status;
    err.detail = detail;
    throw err;
  }

  return res.json();
}
