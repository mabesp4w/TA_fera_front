/** @format */

/**
 * Format number dengan pemisah titik (thousand separator)
 * @param value - Angka yang akan diformat
 * @param decimals - Jumlah desimal (default: 0)
 * @returns String dengan format angka dengan pemisah titik
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number dengan singkatan jika terlalu besar
 * @param value - Angka yang akan diformat
 * @param decimals - Jumlah desimal (default: 1)
 * @returns String dengan format angka yang disingkat (contoh: 1.5M, 2.3K)
 */
export function formatNumberShort(value: number, decimals: number = 1): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}M`; // Miliar
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}Jt`; // Juta
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}Rb`; // Ribu
  }
  return formatNumber(value, 0);
}

/**
 * Format number dengan pemisah titik dan singkatan jika terlalu besar
 * @param value - Angka yang akan diformat
 * @param useShort - Gunakan singkatan jika angka besar (default: true)
 * @param threshold - Threshold untuk menggunakan singkatan (default: 1000)
 * @returns Object dengan formatted value dan keterangan
 */
export function formatNumberWithLabel(
  value: number,
  useShort: boolean = true,
  threshold: number = 1000
): { value: string; label: string; fullValue: string } {
  const fullValue = formatNumber(value, 0);
  
  if (useShort && value >= threshold) {
    const shortValue = formatNumberShort(value);
    return {
      value: shortValue,
      label: `(${fullValue})`,
      fullValue: fullValue,
    };
  }
  
  return {
    value: fullValue,
    label: '',
    fullValue: fullValue,
  };
}

/**
 * Format currency dengan pemisah titik dan singkatan jika terlalu besar
 * @param value - Angka yang akan diformat
 * @param useShort - Gunakan singkatan jika angka besar (default: true)
 * @param threshold - Threshold untuk menggunakan singkatan (default: 1000000)
 * @returns Object dengan formatted value dan keterangan
 */
export function formatCurrencyWithLabel(
  value: number,
  useShort: boolean = true,
  threshold: number = 1_000_000
): { value: string; label: string; fullValue: string } {
  const fullValue = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  
  if (useShort && value >= threshold) {
    let shortValue: string;
    if (value >= 1_000_000_000) {
      shortValue = `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    } else if (value >= 1_000_000) {
      shortValue = `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
    } else {
      shortValue = fullValue;
    }
    
    return {
      value: shortValue,
      label: `(${fullValue.replace('Rp', '').trim()})`,
      fullValue: fullValue,
    };
  }
  
  return {
    value: fullValue,
    label: '',
    fullValue: fullValue,
  };
}

