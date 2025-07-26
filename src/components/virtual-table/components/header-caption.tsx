import { memo, useMemo } from 'react';
import Icon from '../icons';
import { useTableContext } from '../context/table-context';
import VirtualColumnAction from '../virtual-column-action';
import { Checkbox } from './index';

type IHeaderCaption = {
  isShowFilter: boolean;
  headerCaption: string;
  headerKey: string;
};

const HeaderCaption = ({ isShowFilter, headerCaption, headerKey }: IHeaderCaption) => {
  const {
    sort,
    headerHeight,
    handleToggleFilterVisibility,
    flattenedData,
    checkboxSelectionRow: CSR,
  } = useTableContext();

  const { sortKey, sortBy, handleSort, handleSpecificSort } = sort || {};

  const onClickSort = () => handleSort?.(headerKey);

  // Logic untuk kolom selection
  const isSelectAllColumn = headerKey === 'row-selection';
  const totalRows = useMemo(
    () => flattenedData.filter((item) => item.type === 'row').length,
    [flattenedData],
  );
  const selectedCount = useMemo(() => CSR?.selectedRows?.size || 0, [CSR?.selectedRows]);
  const isChecked = selectedCount === totalRows && totalRows > 0;

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      CSR?.handleSelectAllCheckboxRow();
    } else {
      CSR?.handleUnselectAllCheckboxRow();
    }
  };

  if (isSelectAllColumn) {
    return (
      <div
        className='flex items-center justify-center border-b border-gray-200'
        style={{ height: headerHeight }}
      >
        <Checkbox checked={isChecked} onChecked={handleSelectAllChange} />
      </div>
    );
  }

  return (
    <div
      className='flex items-center px-1.5 border-b border-gray-200 cursor-pointer'
      style={{ height: headerHeight }}
      onClick={onClickSort}
    >
      {headerCaption}

      {isShowFilter && (
        <div className='w-full flex justify-between items-center'>
          <Icon
            name='sort'
            className='cursor-pointer ms-2'
            sort={headerKey === sortKey ? sortBy : 'unset'}
            onClick={onClickSort}
          />
          <VirtualColumnAction
            onClickSort={(sortBy) => handleSpecificSort(headerKey, sortBy)}
            onToggleFilterVisibility={handleToggleFilterVisibility}
          />
        </div>
      )}
    </div>
  );
};

export default memo(HeaderCaption) as typeof HeaderCaption;
