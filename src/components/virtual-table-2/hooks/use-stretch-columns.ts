import { useEffect, useState } from 'react';
import { DEFAULT_SIZE, type IColumn } from '../lib';

interface IStretchColumns<TData> {
  columns: IColumn<TData>[];
  outerTableWidth: number;
  scrollbarWidth: number;
}

/**
 * Custom hook untuk menghitung lebar tambahan yang harus diberikan
 * pada kolom-kolom tabel agar memenuhi lebar container induknya.
 *  return extraWidth - Lebar tambahan yang harus ditambahkan ke kolom yang bisa stretch.
 */
export function useStretchColumns<TData>(props: IStretchColumns<TData>) {
  const { columns, outerTableWidth, scrollbarWidth } = props;

  // State untuk menyimpan lebar container induk (scroll container)
  const [parentWidth, setParentWidth] = useState(0);

  // Effect untuk inisialisasi lebar parent saat komponen mount
  useEffect(() => {
    if (outerTableWidth > 0) setParentWidth(outerTableWidth - scrollbarWidth);
  }, [outerTableWidth, scrollbarWidth]);

  // Effect untuk update lebar parent saat window di-resize
  useEffect(() => {
    function handleResize() {
      if (outerTableWidth > 0) setParentWidth(outerTableWidth - scrollbarWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hitung total lebar semua kolom (default width jika tidak ada)
  const totalColumnWidth = columns.reduce(
    (sum, col) => sum + (col.width || DEFAULT_SIZE.COLUMN_WIDTH),
    0,
  );

  // Hitung jumlah kolom yang bisa di-stretch (tidak memiliki flag noStretch)
  const stretchableColumnsCount = columns.filter((col) => !col.noStretch).length;

  // Tentukan apakah perlu stretch (lebar parent lebih besar dari total kolom)
  const stretch = parentWidth > totalColumnWidth && stretchableColumnsCount > 0;

  // Hitung lebar tambahan per kolom yang bisa stretch
  const extraWidth = stretch ? (parentWidth - totalColumnWidth) / stretchableColumnsCount : 0;

  return { extraWidth };
}
