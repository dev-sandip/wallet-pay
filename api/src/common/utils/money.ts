export const MONEY_SCALE = 100;

export class MoneyUtil {
  /**
   * Convert paisa to rupees for display.
   * Example: 150050 paisa -> 1500.50 NPR
   */
  static toRupees(paisa: number): number {
    return paisa / MONEY_SCALE;
  }

  /**
   * Convert rupees to paisa for storage.
   * Example: 1500.50 NPR -> 150050 paisa
   */
  static toPaisa(rupees: number): number {
    if (!Number.isFinite(rupees)) {
      throw new Error('Amount must be a finite number');
    }

    const paisa = Math.round(rupees * MONEY_SCALE);

    if (!Number.isSafeInteger(paisa)) {
      throw new Error('Amount exceeds the safe integer range');
    }

    return paisa;
  }

  /**
   * Format paisa as a display string.
   * Example: 150050 -> NPR 1,500.50
   */
  static formatNPR(paisa: number): string {
    return `NPR ${this.toRupees(paisa).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
